from fastapi import APIRouter
from app.models.schemas import AdditionRequest, AdditionResponse

router = APIRouter(prefix="/api", tags=["demo"])


@router.post("/add", response_model=AdditionResponse)
async def add_numbers(request: AdditionRequest) -> AdditionResponse:
    """
    Demo endpoint to add two numbers.
    This tests the frontend-backend connection.
    """
    result = request.a + request.b
    return AdditionResponse(
        a=request.a,
        b=request.b,
        result=result,
        message=f"{request.a} + {request.b} = {result}"
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Backend is running!"}
