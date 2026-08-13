from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    parcels,
    geojson,
    analysis,
    data_health,
    reports,
    simulation,
    ml,
)


app = FastAPI(
    title="BHUMI-X API",
    description="Government Land Intelligence & Decision Engine",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    # Local development + deployed Vercel frontend
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",

        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",

        "https://bhumi-x.vercel.app",
        "https://bhumi-39d752tpn-chai-cc85.vercel.app",
    ],

    # Allow Vercel preview deployments too
    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(parcels.router)
app.include_router(geojson.router)
app.include_router(analysis.router)
app.include_router(data_health.router)
app.include_router(reports.router)
app.include_router(simulation.router)
app.include_router(ml.router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "BHUMI-X Backend is running",
        "status": "online",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BHUMI-X API",
    }