import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hiro_db")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "hiro_db")

_client = None
_db = None

def get_mongo_client():
    global _client
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=4000)
        except Exception as e:
            print(f"[MongoDB Warning] Could not connect to MongoDB at {MONGO_URI}: {e}")
            return None
    return _client

def get_mongo_db():
    global _db
    if _db is None:
        client = get_mongo_client()
        if client:
            try:
                _db = client[MONGO_DB_NAME]
            except Exception as e:
                print(f"[MongoDB Warning] Failed to select database {MONGO_DB_NAME}: {e}")
                return None
    return _db

# Collection accessors
def get_collection(name: str):
    db = get_mongo_db()
    if db is not None:
        return db[name]
    return None

def sync_document(collection_name: str, doc_id: str, data: dict):
    """
    Upsert document into MongoDB collection by '_id' or 'id'
    """
    col = get_collection(collection_name)
    if col is None:
        return None
    try:
        data['_id'] = str(doc_id)
        col.replace_one({'_id': str(doc_id)}, data, upsert=True)
        return True
    except Exception as e:
        print(f"[MongoDB Warning] Error syncing to {collection_name}: {e}")
        return False
