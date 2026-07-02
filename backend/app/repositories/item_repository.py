import uuid
from typing import Sequence

from sqlmodel import Session, col, func, select

from app.models import Item, ItemCreate, ItemUpdate
from app.repositories.base_repository import BaseRepository


class ItemRepositoryClass(BaseRepository[Item, ItemCreate, ItemUpdate]):
    def __init__(self) -> None:
        super().__init__(Item)

    def list_by_owner(
        self, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> Sequence[Item]:
        statement = (
            select(Item)
            .where(Item.owner_id == owner_id)
            .order_by(col(Item.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()

    def count_by_owner(self, session: Session, owner_id: uuid.UUID) -> int:
        statement = (
            select(func.count())
            .select_from(Item)
            .where(Item.owner_id == owner_id)
        )
        return session.exec(statement).one()


item_repository = ItemRepositoryClass()
