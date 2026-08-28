from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User
from app.core.security import decode_access_token

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency that verifies JWT token and retrieves the current authenticated user."""
    token = auth.credentials if auth and auth.credentials else request.cookies.get("decisionos_access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await db.execute(
        select(User).options(selectinload(User.profile)).filter(User.id == user_id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token does not exist"
        )
    
    return user

async def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Dependency that retrieves user if token is present and valid, else returns None."""
    token = auth.credentials if auth and auth.credentials else request.cookies.get("decisionos_access_token")
    if not token:
        return None
    try:
        user_id = decode_access_token(token)
        if not user_id:
            return None
        result = await db.execute(
            select(User).options(selectinload(User.profile)).filter(User.id == user_id)
        )
        return result.scalars().first()
    except Exception:
        return None
