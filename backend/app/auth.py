from passlib.context import CryptContext
from fastapi import Header, HTTPException

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


def get_current_user_id(
    authorization: str = Header(None)
):

    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    token = authorization.replace("Bearer ", "").strip()

    try:
        return int(token)
    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )