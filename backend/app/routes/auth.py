from fastapi import APIRouter, HTTPException, status
from app.schemas import UserCreateSchema
from app.database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreateSchema):
    """
    Registers a new buyer or agent. If it's an agent, their status defaults to unverified 
    until their PPRA number is audited against the official regulatory registry.
    """
    if user_data.user_type not in ['buyer', 'agent']:
        raise HTTPException(status_code=400, detail="User type must be 'buyer' or 'agent'")
        
    if user_data.user_type == 'agent' and not user_data.ppra_number:
        raise HTTPException(status_code=400, detail="Agents must provide a valid PPRA Practitioner number.")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Check if the email address is already in use
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (user_data.email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        # 2. Insert into the master users table
        user_query = """
            INSERT INTO users (first_name, last_name, email, phone_number, password_hash, user_type)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(user_query, (
            user_data.first_name, user_data.last_name, user_data.email, 
            user_data.phone_number, user_data.password, user_data.user_type
        ))
        
        # Capture the auto-generated primary key
        new_user_id = cursor.lastrowid

        # 3. If an agent signed up, also create their pending safety record profile
        if user_data.user_type == 'agent':
            agent_query = """
                INSERT INTO agents (user_id, agency_name, ppra_number, is_agent_verified)
                VALUES (%s, %s, %s, FALSE)
            """
            cursor.execute(agent_query, (new_user_id, user_data.agency_name, user_data.ppra_number))

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "status": "success",
            "message": f"Successfully registered as a {user_data.user_type}. Verification processing pending."
        }

    except Exception as e:
        # If an error happens while connecting or writing, close the channels safely
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
