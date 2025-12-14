from pydantic import BaseModel
from typing import Optional, List


class AdditionRequest(BaseModel):
    """Request model for addition operation"""
    a: float
    b: float


class AdditionResponse(BaseModel):
    """Response model for addition operation"""
    a: float
    b: float
    result: float
    message: str


class PredictionRequest(BaseModel):
    """Request model for power prediction"""
    is_location_mode: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    hour: int
    month: int
    
    # Manual inputs
    allsky_sfc_sw_dwn: Optional[float] = None
    allsky_kt: Optional[float] = None
    t2m: Optional[float] = None
    t2m_lag1: Optional[float] = None
    sza: Optional[float] = None
    ws10m: Optional[float] = None
    
    # Common inputs
    pm25: float
    pm25_lag1: float
    ac_power_lag1: float
    power_factor_lag1: float


class PredictionResponse(BaseModel):
    """Response model for power prediction"""
    predicted_power: float
    features: List[float]

