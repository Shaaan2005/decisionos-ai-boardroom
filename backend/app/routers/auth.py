from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User, UserProfile
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(key="decisionos_access_token", value=token, httponly=True,
                        secure=settings.COOKIE_SECURE, samesite="lax",
                        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, path="/")

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Register a new DecisionOS user and initialize their executive profile."""
    # Check if email already exists
    existing = await db.execute(select(User).filter(User.email == payload.email.lower()))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Create User
    new_user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name
    )
    db.add(new_user)
    await db.flush()

    # Create associated default profile
    new_profile = UserProfile(
        user_id=new_user.id,
        current_role=payload.current_role or "Senior Professional / Engineer",
        career_goals=payload.career_goals or "Achieve rapid compounding career growth and long-term autonomy.",
        default_risk_tolerance="moderate",
        core_values=["Learning Velocity", "High Agency", "Autonomy", "Long-term Upside"],
        personal_context="Seeking clarity on major career and business transitions."
    )
    db.add(new_profile)
    await db.commit()

    token = create_access_token(subject=new_user.id)
    set_auth_cookie(response, token)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(
    payload: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate an existing user and issue a JWT bearer token."""
    email_clean = payload.email.lower().strip()

    # Dynamic auto-seed for demo account if logging in with demo credentials
    if email_clean == "demo@decisionos.ai" and payload.password == "demouser123":
        try:
            result = await db.execute(select(User).filter(User.email == email_clean))
            user = result.scalars().first()
            if not user:
                user = User(
                    email="demo@decisionos.ai",
                    hashed_password=get_password_hash("demouser123"),
                    full_name="Utkarsh Rai"
                )
                db.add(user)
                await db.flush()
                profile = UserProfile(
                    user_id=user.id,
                    current_role="Founder & Full-Stack Engineer",
                    career_goals="Scale scalable AI systems and achieve career independence.",
                    default_risk_tolerance="moderate",
                    core_values=["Learning Velocity", "High Agency", "Autonomy", "Long-term Upside"],
                    personal_context="Building DecisionOS AI Personal Board of Directors."
                )
                db.add(profile)
                await db.commit()
            token = create_access_token(subject=user.id)
            set_auth_cookie(response, token)
            return TokenResponse(
                access_token=token,
                token_type="bearer",
                user_id=user.id,
                email=user.email,
                full_name=user.full_name
            )
        except Exception:
            pass

    result = await db.execute(select(User).filter(User.email == email_clean))
    user = result.scalars().first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(subject=user.id)
    set_auth_cookie(response, token)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """Retrieve details and profile of the authenticated user."""
    # Exchange legacy bearer-token sessions for the safer HttpOnly cookie.
    set_auth_cookie(response, create_access_token(subject=current_user.id))
    return current_user

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(response: Response):
    response.delete_cookie("decisionos_access_token", path="/")
