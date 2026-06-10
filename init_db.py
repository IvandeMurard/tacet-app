import os
import sys

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base
from app.models.db_models import EnvironmentalState, GeoEvent

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
