from sqlalchemy import Column, String, Float, DateTime, Integer, JSON
from sqlalchemy.sql import func
from .database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    brand = Column(String, default="Fuel Station")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    fuel_types = Column(JSON, default=list)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_name = Column(String)
    from_lat = Column(Float)
    from_lon = Column(Float)
    to_lat = Column(Float)
    to_lon = Column(Float)
    distance_km = Column(Float)
    fuel_used = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
