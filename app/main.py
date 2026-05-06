from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import forecast, webhooks
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Tacet Acoustic Intelligence API",
    description="Proactive Acoustic Intelligence Layer for Hospitality",
    version="1.0.0" # Changed to 1.0.0
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(forecast.router, prefix="/api/v1", tags=["Forecast"])
app.include_router(webhooks.router, prefix="/api/v1", tags=["Webhooks"])

@app.get("/")
async def root():
    return {
        "service": "Tacet API",
        "status": "online",
        "vision": "Orchestrating Silence"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
