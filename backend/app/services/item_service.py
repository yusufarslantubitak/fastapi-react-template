import uuid

from fastapi import HTTPException
from sqlmodel import Session

from app.models import Item, ItemCreate, ItemsPublic, ItemUpdate, User
from app.repositories.item_repository import item_repository


class ItemService:
    @staticmethod
    def get_items(
        session: Session, current_user: User, skip: int = 0, limit: int = 100
    ) -> ItemsPublic:
        if current_user.is_superuser:
            count = item_repository.count_all(session)
            items = item_repository.list_all(session, skip=skip, limit=limit)
        else:
            count = item_repository.count_by_owner(session, owner_id=current_user.id)
            items = item_repository.list_by_owner(
                session, owner_id=current_user.id, skip=skip, limit=limit
            )
        return ItemsPublic(data=list(items), count=count)

    @staticmethod
    def get_item_by_id(
        session: Session, current_user: User, id: uuid.UUID
    ) -> Item:
        item = item_repository.get_by_id(session, id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        if not current_user.is_superuser and (item.owner_id != current_user.id):
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return item

    @staticmethod
    def create_item(
        session: Session, current_user: User, item_in: ItemCreate
    ) -> Item:
        return item_repository.create(session, obj_in=item_in, owner_id=current_user.id)

    @staticmethod
    def update_item(
        session: Session, current_user: User, id: uuid.UUID, item_in: ItemUpdate
    ) -> Item:
        item = item_repository.get_by_id(session, id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        if not current_user.is_superuser and (item.owner_id != current_user.id):
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return item_repository.update(session, db_obj=item, obj_in=item_in)

    @staticmethod
    def delete_item(
        session: Session, current_user: User, id: uuid.UUID
    ) -> None:
        item = item_repository.get_by_id(session, id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        if not current_user.is_superuser and (item.owner_id != current_user.id):
            raise HTTPException(status_code=403, detail="Not enough permissions")
        item_repository.delete(session, db_obj=item)
