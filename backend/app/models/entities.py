import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlmodel import Column, Field, Relationship, SQLModel

from app.models.dto.item import ItemBase
from app.models.dto.user import UserBase


def get_datetime_utc() -> datetime:
    return datetime.now(UTC)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_column=Column(DateTime(timezone=True), default=get_datetime_utc),
    )
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_column=Column(DateTime(timezone=True), default=get_datetime_utc),
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")
