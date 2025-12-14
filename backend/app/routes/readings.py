from fastapi import APIRouter, HTTPException, Query
import pvlib
import pandas as pd
import openaq
from datetime import datetime
import pytz

router = APIRouter(prefix="/api/readings", tags=["readings"])

@router.get("/sza")
def get_sza(lat: float, lon: float):
    try:
        # Get current time in UTC
        now = pd.Timestamp.now(tz='UTC')
        
        # Calculate solar position
        # pvlib expects a DatetimeIndex or similar for efficient calculation, 
        # but passing a single timestamp works and returns a DataFrame with one row.
        solpos = pvlib.solarposition.get_solarposition(
            time=now,
            latitude=lat,
            longitude=lon
        )
        
        sza = solpos['zenith'].iloc[0]
        return {"sza": round(float(sza), 2)}
    except Exception as e:
        print(f"SZA Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pm25")
def get_pm25(lat: float, lon: float):
    # API Key provided by user
    OPENAQ_API_KEY = "58c2a8a33d07e70bab3011b3a8fa933ea7b45ba24aab506c281703cc0e9f0607"
    
    try:
        client = openaq.OpenAQ(api_key=OPENAQ_API_KEY)
        
        # Find nearest location with PM2.5
        # We use the locations endpoint to find the nearest station
        # parameter_id 2 corresponds to PM2.5
        # Note: order_by="distance" caused validation error, removing it. 
        # OpenAQ API v3 usually sorts by distance when coordinates are provided.
        response = client.locations.list(
            coordinates=(lat, lon),
            radius=25000,
            limit=5,
            parameters_id=[2] 
        )
        
        if not response.results:
             return {"pm25": None, "message": "No sensors found within 25km"}
        
        # Sort by distance manually to be safe
        sorted_results = sorted(response.results, key=lambda x: x.distance if x.distance is not None else float('inf'))
        location = sorted_results[0]
        
        # Find the PM2.5 sensor in this location
        # The response is a Pydantic model, so we access attributes directly
        pm25_sensor = next((s for s in location.sensors if s.parameter.id == 2), None)
        
        if pm25_sensor:
            # Fetch latest measurement for this sensor explicitly
            measurements = client.measurements.list(
                sensors_id=pm25_sensor.id,
                limit=1
            )
            
            if measurements.results:
                latest = measurements.results[0]
                return {
                    "pm25": latest.value,
                    "unit": pm25_sensor.parameter.units,
                    "location": location.name,
                    "distance": getattr(location, 'distance', None)
                }
        
        return {"pm25": None, "message": "PM2.5 data not found in closest sensor"}
            
    except Exception as e:
        print(f"OpenAQ Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching PM2.5: {str(e)}")
