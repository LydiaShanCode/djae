from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import certifi

# Global MongoDB client instance
mongodb_client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongodb(mongodb_uri: str):
    """
    Connect to MongoDB Atlas using Motor async client.
    
    Args:
        mongodb_uri: MongoDB connection string
    """
    global mongodb_client
    try:
        mongodb_client = AsyncIOMotorClient(
            mongodb_uri,
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        # Test the connection
        await mongodb_client.admin.command('ping')
        print("Connected to MongoDB Atlas")
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB: {e}")
        print("Application will continue without database connection")
        mongodb_client = None


async def close_mongodb_connection():
    """
    Close MongoDB connection.
    """
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        print("Closed MongoDB Atlas connection")


async def check_database_connection() -> bool:
    """
    Check if the database connection is active by pinging the server.
    
    Returns:
        bool: True if connected, False otherwise
    """
    global mongodb_client
    if mongodb_client is None:
        return False
    
    try:
        # Ping the database to check connection with a timeout
        await mongodb_client.admin.command('ping')
        return True
    except Exception as e:
        print(f"Database connection check failed: {e}")
        return False


def get_database():
    """
    Get the database instance.
    
    Returns:
        Database instance for 'djsimulator' database
    """
    global mongodb_client
    if mongodb_client is None:
        raise Exception("Database not connected")
    return mongodb_client.djsimulator