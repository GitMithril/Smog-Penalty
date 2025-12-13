from pydantic import BaseModel


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
