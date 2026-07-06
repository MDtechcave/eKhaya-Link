from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreateSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    password: str
    user_type: str  #  'buyer' or 'agent'
    
    
    agency_name: Optional[str] = None
    ppra_number: Optional[str] = Field(
        None,
        pattern=r"^\d{7}$",
        description="Official 7-didgit PPRA practitioner reference number"
    )

    

class PropertyCreateSchema(BaseModel):
    agent_id: int
    title: str
    price: float
    area_section: str
    erf_number: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
