from app.models.entities import Item, User
from app.models.dto import (
    ItemBase,
    ItemCreate,
    ItemPublic,
    ItemsPublic,
    ItemUpdate,
    Message,
    NewPassword,
    Token,
    TokenPayload,
    UpdatePassword,
    UserBase,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)

# Resolve circular ForwardRefs for Pydantic V2/SQLModel at runtime
User.model_rebuild()
Item.model_rebuild()
