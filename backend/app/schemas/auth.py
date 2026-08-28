from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


def validate_bcrypt_password_length(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")
    return password

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    current_role: Optional[str] = None
    career_goals: Optional[str] = None

    _validate_password_length = field_validator("password")(validate_bcrypt_password_length)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

    _validate_password_length = field_validator("password")(validate_bcrypt_password_length)

class TokenResponse(BaseModel):
    # Retained for non-browser API clients; the browser uses the HttpOnly cookie.
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
