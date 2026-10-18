from fastapi import APIRouter, Depends, HTTPException
from models.user import UserCreate, UserLogin, Token
from core.database import get_db, query_one, execute
from core.security import get_password_hash, verify_password, create_access_token
from datetime import datetime

router = APIRouter()


def _db_error():
    return HTTPException(
        status_code=503,
        detail="Database is unavailable. Check database connection.",
    )


@router.post("/register", response_model=Token)
async def register(user: UserCreate, db=Depends(get_db)):
    try:
        print(f"Register attempt for {user.email}")
        existing_user = await query_one("SELECT 1 FROM users WHERE email = %s", (user.email,))
        if existing_user:
            print("User already exists")
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user.password)
        print("Password hashed")
        await execute(
            "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (user.name, user.email, hashed_password, "user", datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
        )
        print("User inserted")
        access_token = create_access_token(data={"sub": user.email})
        print("Token created")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Error in register: {exc}")
        raise _db_error() from exc


@router.post("/login", response_model=Token)
async def login(user: UserLogin, db=Depends(get_db)):
    try:
        db_user = await query_one("SELECT * FROM users WHERE email = %s", (user.email,))
        if not db_user or not verify_password(user.password, db_user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as exc:
        raise _db_error() from exc
