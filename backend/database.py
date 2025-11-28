from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class Database:
    client: AsyncIOMotorClient = None

    async def connect_to_database(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        # Verify connection
        await self.client.admin.command('ping')
        print("Connected to MongoDB")
        
    async def close_database_connection(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

db = Database()