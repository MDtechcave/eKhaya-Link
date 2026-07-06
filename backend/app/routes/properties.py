from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.schemas import PropertyCreateSchema
from app.database import get_db_connection

router = APIRouter(prefix="/api/properties", tags=["Properties Marketplace"])

#  Action schema for when an admin audits paperwork
class AdminVerificationPayload(BaseModel):
    property_id: int
    action: str  # Must be 'APPROVE' or 'REJECT'

@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_property(property_data: PropertyCreateSchema):
    """Allows agents to upload listings (Defaults to pending vetting)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO properties (agent_id, title, price, area_section, erf_number, latitude, longitude, verification_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
        """
        cursor.execute(query, (
            property_data.agent_id, property_data.title, property_data.price,
            property_data.area_section, property_data.erf_number,
            property_data.latitude, property_data.longitude
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Property submitted. Awaiting verification check."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 1. NEW ENDPOINT: Fetch only scam-protected verified properties for the map
@router.get("/verified-feed")
def get_verified_properties(area: Optional[str] = None):
    """
    Returns only listings that have passed the paperwork checks.
    This feeds your Next.js interactive layout layer.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) # Returns data as a clean dictionary
        
        query = "SELECT * FROM properties WHERE verification_status = 'verified' AND is_available = TRUE"
        params = []
        
        if area and area != "All":
            query += " AND area_section = %s"
            params.append(area)
            
        cursor.execute(query, tuple(params))
        listings = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return listings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. NEW ENDPOINT: Admin tool to switch listing states live
@router.post("/admin-verify", status_code=status.HTTP_200_OK)
def admin_verify_listing(payload: AdminVerificationPayload):
    """
    Admin control line. Switches pending properties to verified, pushing them onto the map.
    """
    if payload.action not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Action must be 'APPROVE' or 'REJECT'")
        
    new_status = "verified" if payload.action == "APPROVE" else "rejected"
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "UPDATE properties SET verification_status = %s WHERE property_id = %s"
        cursor.execute(query, (new_status, payload.property_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "message": f"Listing {payload.property_id} has been marked as {new_status}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
