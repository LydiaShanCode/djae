from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import health
from database import connect_to_mongodb, close_mongodb_connection
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup: Connect to MongoDB
    await connect_to_mongodb(settings.mongodb_uri)
    yield
    # Shutdown: Close MongoDB connection
    await close_mongodb_connection()


app = FastAPI(
    title="DJ Simulator API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include health router without prefix (at root level)
app.include_router(health.router, tags=["health"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "DJ Simulator API", "version": "1.0.0"}