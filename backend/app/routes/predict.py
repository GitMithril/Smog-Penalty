import requests
import math
import numpy as np
import pandas as pd
import joblib
import lightgbm as lgb
import os
from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest, PredictionResponse

router = APIRouter(prefix="/api", tags=["prediction"])
"""
# Load Models
try:
    # backend/app/routes/predict.py -> backend/
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODELS_DIR = os.path.join(BASE_DIR, "../models")
    
    LGBM_PATH = os.path.join(MODELS_DIR, "lgbm_shallow_model.pkl")
    LOG_REG_PATH = os.path.join(MODELS_DIR, "log_reg_pipeline.pkl")
    
    print(f"Loading models from: {MODELS_DIR}")
    
    lgbm_model = lgb.Booster(model_file=LGBM_PATH)
    log_reg_model = joblib.load(LOG_REG_PATH)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    # We don't raise here to allow the app to start, but prediction will fail if models aren't loaded
    lgbm_model = None
    log_reg_model = None
"""
# Load Models
try:
    # backend/app/routes/predict.py -> backend/
    BASE_DIR = os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )

    MODELS_DIR = os.path.normpath(
        os.path.join(BASE_DIR, "../models")
    )

    LGBM_PATH = os.path.join(MODELS_DIR, "lgb_shallow_model.pkl")
    LOG_REG_PATH = os.path.join(MODELS_DIR, "log_reg_pipeline.pkl")

    print(f"Loading models from: {MODELS_DIR}")

    lgbm_model = joblib.load(LGBM_PATH)
    log_reg_model = joblib.load(LOG_REG_PATH)

    print("Models loaded successfully.")

except Exception as e:
    print(f"Error loading models: {e}")
    lgbm_model = None
    log_reg_model = None


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
