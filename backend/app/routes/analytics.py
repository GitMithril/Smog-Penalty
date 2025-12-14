from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from datetime import datetime

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Path to the data file
# Go up 4 levels: routes -> app -> backend -> Project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_PATH = os.path.join(BASE_DIR, "data", "merged_data.csv")


@router.get("/history")
async def get_historical_data(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    interval: str = Query("hour", description="Aggregation interval: hour, day, month")
):
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=500, detail=f"Data file not found at {DATA_PATH}")

    try:
        # Read CSV
        df = pd.read_csv(DATA_PATH)
        
        # Ensure datetime column is datetime objects
        df['datetime'] = pd.to_datetime(df['datetime'])
        
        # Parse query dates
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date) + pd.Timedelta(days=1) - pd.Timedelta(seconds=1) # Include the whole end day
        
        # Filter data
        mask = (df['datetime'] >= start) & (df['datetime'] <= end)
        filtered_df = df.loc[mask].copy()
        
        if filtered_df.empty:
            return []

        # Sort by date
        filtered_df.sort_values('datetime', inplace=True)
        
        result = []
        
        if interval == 'month':
            # Resample by Month Start and calculate mean
            # Using 'MS' for Month Start
            resampled = filtered_df.set_index('datetime').resample('MS')['AC Power/m2'].mean().reset_index()
            for _, row in resampled.iterrows():
                result.append({
                    "time": row['datetime'].strftime("%b"), # Jan, Feb, etc.
                    "full_date": row['datetime'].strftime("%Y-%m"),
                    "power": float(row['AC Power/m2']) if pd.notnull(row['AC Power/m2']) else 0.0
                })
        elif interval == 'day':
            # Resample by Day and calculate mean
            resampled = filtered_df.set_index('datetime').resample('D')['AC Power/m2'].mean().reset_index()
            for _, row in resampled.iterrows():
                result.append({
                    "time": row['datetime'].strftime("%d"), # 01, 02, etc.
                    "full_date": row['datetime'].strftime("%Y-%m-%d"),
                    "power": float(row['AC Power/m2']) if pd.notnull(row['AC Power/m2']) else 0.0
                })
        else: # hour
            # Select relevant columns and format
            for _, row in filtered_df.iterrows():
                result.append({
                    "time": row['datetime'].strftime("%H:%M"),
                    "full_date": row['datetime'].strftime("%Y-%m-%d %H:%M"),
                    "power": float(row['AC Power/m2']) if pd.notnull(row['AC Power/m2']) else 0.0
                })
            
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
