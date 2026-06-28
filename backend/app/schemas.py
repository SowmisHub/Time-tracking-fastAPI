from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ActivityCreate(BaseModel):
    name: str
    category: str
    duration: int
    


class ActivityUpdate(BaseModel):
    name: str
    category: str
    duration: int
    