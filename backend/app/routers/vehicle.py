"""
Vehicle database endpoint — curated Indian vehicle specs.
No external API required; data is embedded for reliability.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Literal

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

FuelType = Literal["petrol", "diesel", "cng", "electric"]


class VehicleSpec(BaseModel):
    brand: str
    model: str
    fuel_type: FuelType
    tank_capacity: float   # litres
    mileage: float         # km/L (ARAI certified)
    year: int = 2024


# Curated Indian vehicle database with verified specs
_DB: List[VehicleSpec] = [
    # ── Maruti Suzuki ──────────────────────────────────────────
    VehicleSpec(brand="Maruti Suzuki", model="Alto K10",          fuel_type="petrol", tank_capacity=35, mileage=24.39),
    VehicleSpec(brand="Maruti Suzuki", model="Wagon R",           fuel_type="petrol", tank_capacity=32, mileage=25.19),
    VehicleSpec(brand="Maruti Suzuki", model="Swift",             fuel_type="petrol", tank_capacity=37, mileage=23.76),
    VehicleSpec(brand="Maruti Suzuki", model="Swift Dzire",       fuel_type="petrol", tank_capacity=37, mileage=23.26),
    VehicleSpec(brand="Maruti Suzuki", model="Baleno",            fuel_type="petrol", tank_capacity=37, mileage=22.35),
    VehicleSpec(brand="Maruti Suzuki", model="Celerio",           fuel_type="petrol", tank_capacity=32, mileage=26.68),
    VehicleSpec(brand="Maruti Suzuki", model="Ignis",             fuel_type="petrol", tank_capacity=32, mileage=20.89),
    VehicleSpec(brand="Maruti Suzuki", model="Brezza",            fuel_type="petrol", tank_capacity=48, mileage=17.38),
    VehicleSpec(brand="Maruti Suzuki", model="Ertiga",            fuel_type="petrol", tank_capacity=45, mileage=20.30),
    VehicleSpec(brand="Maruti Suzuki", model="Grand Vitara",      fuel_type="petrol", tank_capacity=45, mileage=21.11),
    VehicleSpec(brand="Maruti Suzuki", model="XL6",               fuel_type="petrol", tank_capacity=45, mileage=20.97),
    VehicleSpec(brand="Maruti Suzuki", model="Jimny",             fuel_type="petrol", tank_capacity=40, mileage=16.39),
    VehicleSpec(brand="Maruti Suzuki", model="Fronx",             fuel_type="petrol", tank_capacity=37, mileage=21.79),
    # ── Hyundai ────────────────────────────────────────────────
    VehicleSpec(brand="Hyundai", model="Grand i10 NIOS",          fuel_type="petrol", tank_capacity=37, mileage=20.70),
    VehicleSpec(brand="Hyundai", model="i20",                     fuel_type="petrol", tank_capacity=37, mileage=20.35),
    VehicleSpec(brand="Hyundai", model="Venue",                   fuel_type="petrol", tank_capacity=45, mileage=17.50),
    VehicleSpec(brand="Hyundai", model="Creta",                   fuel_type="petrol", tank_capacity=50, mileage=17.00),
    VehicleSpec(brand="Hyundai", model="Verna",                   fuel_type="petrol", tank_capacity=45, mileage=17.00),
    VehicleSpec(brand="Hyundai", model="Tucson",                  fuel_type="petrol", tank_capacity=54, mileage=14.04),
    VehicleSpec(brand="Hyundai", model="Aura",                    fuel_type="petrol", tank_capacity=37, mileage=20.50),
    VehicleSpec(brand="Hyundai", model="Exter",                   fuel_type="petrol", tank_capacity=37, mileage=19.40),
    VehicleSpec(brand="Hyundai", model="Alcazar",                 fuel_type="petrol", tank_capacity=50, mileage=14.50),
    # ── Tata Motors ────────────────────────────────────────────
    VehicleSpec(brand="Tata", model="Tiago",                      fuel_type="petrol", tank_capacity=35, mileage=23.84),
    VehicleSpec(brand="Tata", model="Altroz",                     fuel_type="petrol", tank_capacity=37, mileage=19.05),
    VehicleSpec(brand="Tata", model="Punch",                      fuel_type="petrol", tank_capacity=37, mileage=18.97),
    VehicleSpec(brand="Tata", model="Nexon",                      fuel_type="petrol", tank_capacity=44, mileage=17.01),
    VehicleSpec(brand="Tata", model="Harrier",                    fuel_type="diesel", tank_capacity=50, mileage=14.64),
    VehicleSpec(brand="Tata", model="Safari",                     fuel_type="diesel", tank_capacity=50, mileage=14.08),
    VehicleSpec(brand="Tata", model="Curvv",                      fuel_type="petrol", tank_capacity=45, mileage=16.16),
    # ── Honda ──────────────────────────────────────────────────
    VehicleSpec(brand="Honda", model="Amaze",                     fuel_type="petrol", tank_capacity=35, mileage=18.60),
    VehicleSpec(brand="Honda", model="City",                      fuel_type="petrol", tank_capacity=40, mileage=18.40),
    VehicleSpec(brand="Honda", model="Elevate",                   fuel_type="petrol", tank_capacity=40, mileage=15.35),
    VehicleSpec(brand="Honda", model="WR-V",                      fuel_type="petrol", tank_capacity=40, mileage=16.50),
    # ── Toyota ─────────────────────────────────────────────────
    VehicleSpec(brand="Toyota", model="Glanza",                   fuel_type="petrol", tank_capacity=37, mileage=22.35),
    VehicleSpec(brand="Toyota", model="Urban Cruiser Hyryder",    fuel_type="petrol", tank_capacity=36, mileage=21.11),
    VehicleSpec(brand="Toyota", model="Innova Crysta",            fuel_type="diesel", tank_capacity=65, mileage=11.26),
    VehicleSpec(brand="Toyota", model="Innova HyCross",           fuel_type="petrol", tank_capacity=52, mileage=21.10),
    VehicleSpec(brand="Toyota", model="Fortuner",                 fuel_type="diesel", tank_capacity=80, mileage=10.02),
    # ── Kia ────────────────────────────────────────────────────
    VehicleSpec(brand="Kia", model="Sonet",                       fuel_type="petrol", tank_capacity=45, mileage=18.20),
    VehicleSpec(brand="Kia", model="Seltos",                      fuel_type="petrol", tank_capacity=50, mileage=16.50),
    VehicleSpec(brand="Kia", model="Carens",                      fuel_type="petrol", tank_capacity=45, mileage=16.50),
    VehicleSpec(brand="Kia", model="EV6",                         fuel_type="electric", tank_capacity=77, mileage=55.00),
    # ── Mahindra ───────────────────────────────────────────────
    VehicleSpec(brand="Mahindra", model="XUV 3XO",               fuel_type="petrol", tank_capacity=40, mileage=18.09),
    VehicleSpec(brand="Mahindra", model="XUV300",                 fuel_type="petrol", tank_capacity=42, mileage=17.00),
    VehicleSpec(brand="Mahindra", model="Scorpio-N",              fuel_type="diesel", tank_capacity=60, mileage=14.72),
    VehicleSpec(brand="Mahindra", model="XUV700",                 fuel_type="diesel", tank_capacity=70, mileage=16.00),
    VehicleSpec(brand="Mahindra", model="Thar",                   fuel_type="diesel", tank_capacity=57, mileage=15.20),
    VehicleSpec(brand="Mahindra", model="Bolero",                 fuel_type="diesel", tank_capacity=70, mileage=16.00),
    # ── Volkswagen ─────────────────────────────────────────────
    VehicleSpec(brand="Volkswagen", model="Polo",                 fuel_type="petrol", tank_capacity=45, mileage=17.00),
    VehicleSpec(brand="Volkswagen", model="Virtus",               fuel_type="petrol", tank_capacity=50, mileage=19.89),
    VehicleSpec(brand="Volkswagen", model="Taigun",               fuel_type="petrol", tank_capacity=50, mileage=17.31),
    # ── Skoda ──────────────────────────────────────────────────
    VehicleSpec(brand="Skoda", model="Rapid",                     fuel_type="petrol", tank_capacity=55, mileage=18.97),
    VehicleSpec(brand="Skoda", model="Slavia",                    fuel_type="petrol", tank_capacity=47, mileage=19.47),
    VehicleSpec(brand="Skoda", model="Kushaq",                    fuel_type="petrol", tank_capacity=50, mileage=16.35),
    # ── MG ─────────────────────────────────────────────────────
    VehicleSpec(brand="MG", model="Hector",                       fuel_type="petrol", tank_capacity=52, mileage=14.16),
    VehicleSpec(brand="MG", model="Astor",                        fuel_type="petrol", tank_capacity=52, mileage=15.84),
    VehicleSpec(brand="MG", model="ZS EV",                        fuel_type="electric", tank_capacity=50, mileage=42.00),
    # ── Renault ────────────────────────────────────────────────
    VehicleSpec(brand="Renault", model="Kwid",                    fuel_type="petrol", tank_capacity=28, mileage=22.04),
    VehicleSpec(brand="Renault", model="Triber",                  fuel_type="petrol", tank_capacity=40, mileage=18.98),
    VehicleSpec(brand="Renault", model="Kiger",                   fuel_type="petrol", tank_capacity=40, mileage=18.27),
    # ── Nissan ─────────────────────────────────────────────────
    VehicleSpec(brand="Nissan", model="Magnite",                  fuel_type="petrol", tank_capacity=40, mileage=20.00),
    # ── Jeep ───────────────────────────────────────────────────
    VehicleSpec(brand="Jeep", model="Compass",                    fuel_type="diesel", tank_capacity=60, mileage=17.10),
    VehicleSpec(brand="Jeep", model="Meridian",                   fuel_type="diesel", tank_capacity=60, mileage=16.43),
]


@router.get("/makes", response_model=List[str])
async def get_makes():
    return sorted(set(v.brand for v in _DB))


@router.get("/models", response_model=List[VehicleSpec])
async def get_models(brand: str):
    return [v for v in _DB if v.brand.lower() == brand.lower()]


@router.get("/spec", response_model=VehicleSpec)
async def get_spec(brand: str, model: str):
    for v in _DB:
        if v.brand.lower() == brand.lower() and v.model.lower() == model.lower():
            return v
    # Fallback generic spec
    return VehicleSpec(brand=brand, model=model, fuel_type="petrol", tank_capacity=40, mileage=15.0)
