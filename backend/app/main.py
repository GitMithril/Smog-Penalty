from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.demo import router as demo_router
from app.routes.predict import router as predict_router

app = FastAPI(
    title="ML Project API",
    description="FastAPI backend for Machine Learning project with scikit-learn",
    version="1.0.0"
)

# Configure CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(demo_router)
app.include_router(predict_router)



@app.get("/")
async def root():
    return {
        "message": "Welcome to ML Project API",
        "docs": "/docs",
        "health": "/api/health"
    }
