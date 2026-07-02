from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.models import Message, Token, UserPublic
from app.services.user_service import UserService

router = APIRouter(tags=["login"])


@router.post("/login/access-token")
def login_access_token(
    response: Response,
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = UserService.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    response.set_cookie(
        key="access_token",
        value=token_str,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.ENVIRONMENT != "local",
    )
    return Token(access_token=token_str)


@router.post("/login/logout")
def logout(response: Response) -> Message:
    """
    Log out the current user by clearing the access token cookie
    """
    response.delete_cookie(
        key="access_token",
        samesite="lax",
        secure=settings.ENVIRONMENT != "local",
    )
    return Message(message="Successfully logged out")


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user

