import requests
import math
import numpy as np
import pandas as pd
import joblib
import lightgbm as lgb
import os
import io
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from app.models.schemas import PredictionRequest, PredictionResponse

router = APIRouter(prefix="/api", tags=["prediction"])

# Load Models
try:
    # backend/app/routes/predict.py -> backend/
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODELS_DIR = os.path.join(BASE_DIR, "../models")
    
    LGBM_PATH = os.path.join(MODELS_DIR, "lgb_shallow_model.pkl")
    LOG_REG_PATH = os.path.join(MODELS_DIR, "log_reg_pipeline.pkl")
    
    print(f"Loading models from: {MODELS_DIR}")
    
    lgbm_model = joblib.load(LGBM_PATH)
    log_reg_model = joblib.load(LOG_REG_PATH)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    # We don't raise here to allow the app to start, but prediction will fail if models aren't loaded
    lgbm_model = None
    log_reg_model = None

@router.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    if lgbm_model is None or log_reg_model is None:
        raise HTTPException(status_code=500, detail="Models not loaded properly on server.")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Required features (excluding AC Power and Cyclic features which are handled dynamically)
        base_required_features = ['PM25', 'ALLSKY_SFC_SW_DWN', 'ALLSKY_KT', 'T2M', 'WS10M', 'SZA', 'T2M_Lag1', 'PM25_Lag1', 'power_factor_Lag1']
        
        # Check for missing base columns
        missing_cols = [col for col in base_required_features if col not in df.columns]
        if missing_cols:
             raise HTTPException(status_code=400, detail=f"Missing columns in CSV: {missing_cols}")

        # Handle Cyclic Features
        cyclic_features = ['Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos']
        if not all(col in df.columns for col in cyclic_features):
            # Try to calculate them from Hour and Month
            # Normalize column names if needed
            if 'hour' in df.columns and 'Hour' not in df.columns: df.rename(columns={'hour': 'Hour'}, inplace=True)
            if 'month' in df.columns and 'Month' not in df.columns: df.rename(columns={'month': 'Month'}, inplace=True)

            # Check for datetime column if Hour/Month are missing
            if ('Hour' not in df.columns or 'Month' not in df.columns):
                datetime_col = None
                if 'datetime' in df.columns: datetime_col = 'datetime'
                elif 'timestamp' in df.columns: datetime_col = 'timestamp'
                elif 'Date' in df.columns: datetime_col = 'Date'
                
                if datetime_col:
                    try:
                        df[datetime_col] = pd.to_datetime(df[datetime_col])
                        if 'Hour' not in df.columns:
                            df['Hour'] = df[datetime_col].dt.hour
                        if 'Month' not in df.columns:
                            df['Month'] = df[datetime_col].dt.month
                    except Exception as e:
                        print(f"Error parsing datetime column: {e}")

            if 'Hour' in df.columns and 'Month' in df.columns:
                 df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
                 df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
                 df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
                 df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)
            else:
                 raise HTTPException(status_code=400, detail="Missing cyclic features (Hour_sin, etc.) and missing 'Hour'/'Month' or 'datetime' columns to calculate them.")
        
        # Handle AC Power column
        ac_power_col = None
        if 'AC_Power/m2_Lag1' in df.columns:
            ac_power_col = 'AC_Power/m2_Lag1'
        elif 'AC Power/m2_Lag1' in df.columns:
            ac_power_col = 'AC Power/m2_Lag1'
        elif 'AC_Power_Lag1' in df.columns:
             # Rename to what models expect temporarily
             df['AC_Power/m2_Lag1'] = df['AC_Power_Lag1']
             df['AC Power/m2_Lag1'] = df['AC_Power_Lag1']
             ac_power_col = 'AC_Power/m2_Lag1' # Default to one
        else:
             raise HTTPException(status_code=400, detail="Missing AC Power Lag1 column (expected 'AC_Power/m2_Lag1' or 'AC Power/m2_Lag1')")

        # Ensure both variants exist for the models
        if 'AC_Power/m2_Lag1' not in df.columns:
             df['AC_Power/m2_Lag1'] = df[ac_power_col]
        if 'AC Power/m2_Lag1' not in df.columns:
             df['AC Power/m2_Lag1'] = df[ac_power_col]

        # Fill NaNs for Lag features with reasonable defaults
        # This is crucial for the first row or missing data to avoid "off" predictions or errors
        df['AC_Power/m2_Lag1'] = df['AC_Power_Lag1'].fillna(0.0) if 'AC_Power_Lag1' in df.columns else df['AC_Power/m2_Lag1'].fillna(0.0)
        df['AC Power/m2_Lag1'] = df['AC Power/m2_Lag1'].fillna(0.0)
        
        if 'power_factor_Lag1' in df.columns:
            df['power_factor_Lag1'] = df['power_factor_Lag1'].fillna(0.95) # Default to 0.95 if missing
        
        if 'PM25_Lag1' in df.columns:
             df['PM25_Lag1'] = df['PM25_Lag1'].fillna(method='bfill').fillna(0.0) # Backfill then 0
             
        if 'T2M_Lag1' in df.columns:
             df['T2M_Lag1'] = df['T2M_Lag1'].fillna(method='bfill').fillna(25.0) # Backfill then 25C

        predictions = []
        
        # Iterate through rows
        for index, row in df.iterrows():
            pm25_val = row['PM25']
            
            if pm25_val <= 35:
                # Use LGBM
                lgbm_cols = ['PM25', 'ALLSKY_SFC_SW_DWN', 'ALLSKY_KT', 'T2M', 'WS10M', 'SZA', 'T2M_Lag1', 'PM25_Lag1', 'AC_Power/m2_Lag1', 'power_factor_Lag1', 'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos']
                # Create single row dataframe
                row_df = pd.DataFrame([row[lgbm_cols]])
                pred = lgbm_model.predict(row_df)[0]
            else:
                # Use LogReg
                logreg_cols = ['PM25', 'ALLSKY_SFC_SW_DWN', 'ALLSKY_KT', 'T2M', 'WS10M', 'SZA', 'T2M_Lag1', 'PM25_Lag1', 'AC Power/m2_Lag1', 'power_factor_Lag1', 'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos']
                row_df = pd.DataFrame([row[logreg_cols]])
                pred = log_reg_model.predict(row_df)[0]
            
            predictions.append(pred)
            
        df['Predicted_Power'] = predictions
        
        # Convert back to CSV
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=predictions.csv"
        return response

    except Exception as e:
        print(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@router.post("/predict", response_model=PredictionResponse)
async def predict_power(request: PredictionRequest):
    print("Received Prediction Request:", request.model_dump())
    
    if lgbm_model is None or log_reg_model is None:
        raise HTTPException(status_code=500, detail="Models not loaded properly on server.")

    # Initialize variables
    allsky_sfc_sw_dwn = 0.0
    allsky_kt = 0.0
    t2m = 0.0
    sza = 0.0
    ws10m = 0.0
    
    t2m_lag1 = 0.0
    
    # NASA API Logic
    if request.is_location_mode:
        if request.latitude is None or request.longitude is None:
            raise HTTPException(status_code=400, detail="Latitude and Longitude required for Location Mode")
            
        lat = request.latitude
        long = request.longitude
        
        # Hardcoded dates as per instructions
        start_date = "20250101"
        end_date = "20250102"
        
        url = (
            "https://power.larc.nasa.gov/api/temporal/hourly/point"
            f"?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_KT,T2M,SZA,WS10M"
            "&community=RE"
            f"&latitude={lat}"
            f"&longitude={long}"
            f"&start={start_date}"
            f"&end={end_date}"
            "&format=JSON"
        )
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            properties = data.get("properties", {}).get("parameter", {})
            
            # Construct keys
            # Assuming we use the first day (start_date) for the 'hour'
            target_key = f"{start_date}{request.hour:02d}"
            
            # Determine previous key
            if request.hour == 8:
                prev_key = target_key # Edge case: repeat 08:00 value
            else:
                if request.hour == 0:
                     prev_key = target_key
                else:
                     prev_key = f"{start_date}{request.hour-1:02d}"
            
            # Extract values
            def get_val(param, key):
                return properties.get(param, {}).get(key, 0.0)
            
            allsky_sfc_sw_dwn = get_val("ALLSKY_SFC_SW_DWN", target_key)
            allsky_kt = get_val("ALLSKY_KT", target_key)
            t2m = get_val("T2M", target_key)
            sza = get_val("SZA", target_key)
            ws10m = get_val("WS10M", target_key)
            
            t2m_lag1 = get_val("T2M", prev_key)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching NASA data: {str(e)}")
            
    else:
        # Manual Mode
        allsky_sfc_sw_dwn = request.allsky_sfc_sw_dwn or 0.0
        allsky_kt = request.allsky_kt or 0.0
        t2m = request.t2m or 0.0
        sza = request.sza or 0.0
        ws10m = request.ws10m or 0.0
        
        # For manual mode, use provided lag1 or fallback to current t2m
        t2m_lag1 = request.t2m_lag1 if request.t2m_lag1 is not None else t2m

    # Calculate Cyclic Features
    # Hour is 0-23?
    hour_sin = math.sin(2 * math.pi * request.hour / 24)
    hour_cos = math.cos(2 * math.pi * request.hour / 24)
    
    # Month is 1-12?
    month_sin = math.sin(2 * math.pi * request.month / 12)
    month_cos = math.cos(2 * math.pi * request.month / 12)
    
    # Construct Feature Dictionary
    # Common features
    feature_data = {
        'PM25': [request.pm25],
        'ALLSKY_SFC_SW_DWN': [allsky_sfc_sw_dwn],
        'ALLSKY_KT': [allsky_kt],
        'T2M': [t2m],
        'WS10M': [ws10m],
        'SZA': [sza],
        'T2M_Lag1': [t2m_lag1],
        'PM25_Lag1': [request.pm25_lag1],
        # AC Power Lag1 key differs between models
        'power_factor_Lag1': [request.power_factor_lag1],
        'Hour_sin': [hour_sin],
        'Hour_cos': [hour_cos],
        'Month_sin': [month_sin],
        'Month_cos': [month_cos]
    }

    predicted_power = 0.0

    try:
        if request.pm25 <= 25:
            # Use LGBM Shallow Model
            # Feature name: AC_Power/m2_Lag1
            feature_data['AC_Power/m2_Lag1'] = [request.ac_power_lag1]
            
            # Ensure correct order for LGBM
            lgbm_cols = ['PM25', 'ALLSKY_SFC_SW_DWN', 'ALLSKY_KT', 'T2M', 'WS10M', 'SZA', 'T2M_Lag1', 'PM25_Lag1', 'AC_Power/m2_Lag1', 'power_factor_Lag1', 'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos']
            df = pd.DataFrame(feature_data)
            df = df[lgbm_cols]
            
            # Predict
            prediction = lgbm_model.predict(df)
            predicted_power = float(prediction[0])
            print(f"Used LGBM Shallow Model. Prediction: {predicted_power}")
            
        else:
            # Use Log Reg Pipeline
            # Feature name: AC Power/m2_Lag1
            feature_data['AC Power/m2_Lag1'] = [request.ac_power_lag1]
            
            # Ensure correct order for LogReg (though pipeline might handle it if names match, but safer to order)
            logreg_cols = ['PM25', 'ALLSKY_SFC_SW_DWN', 'ALLSKY_KT', 'T2M', 'WS10M', 'SZA', 'T2M_Lag1', 'PM25_Lag1', 'AC Power/m2_Lag1', 'power_factor_Lag1', 'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos']
            df = pd.DataFrame(feature_data)
            df = df[logreg_cols]
            
            # Predict
            prediction = log_reg_model.predict(df)
            predicted_power = float(prediction[0])
            print(f"Used LogReg Pipeline. Prediction: {predicted_power}")

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    
    # Construct features list for response (just values)
    features_list = [
        request.pm25,
        allsky_sfc_sw_dwn,
        allsky_kt,
        t2m,
        ws10m,
        sza,
        t2m_lag1,
        request.pm25_lag1,
        request.ac_power_lag1,
        request.power_factor_lag1,
        hour_sin,
        hour_cos,
        month_sin,
        month_cos
    ]

    return PredictionResponse(
        predicted_power=predicted_power,
        features=features_list
    )
