import uuid
from typing import Generic, Type, TypeVar, Sequence

from sqlmodel import Session, SQLModel, select, func, col

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get_by_id(self, session: Session, id: uuid.UUID) -> ModelType | None:
        return session.get(self.model, id)

    def list_all(self, session: Session, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        statement = select(self.model)
        if hasattr(self.model, "created_at"):
            statement = statement.order_by(col(getattr(self.model, "created_at")).desc())
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def count_all(self, session: Session) -> int:
        statement = select(func.count()).select_from(self.model)
        return session.exec(statement).one()

    def create(self, session: Session, *, obj_in: CreateSchemaType, **kwargs: uuid.UUID) -> ModelType:
        db_obj = self.model.model_validate(obj_in, update=kwargs)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def update(self, session: Session, *, db_obj: ModelType, obj_in: UpdateSchemaType) -> ModelType:
        update_data = obj_in.model_dump(exclude_unset=True)
        db_obj.sqlmodel_update(update_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def delete(self, session: Session, *, db_obj: ModelType) -> None:
        session.delete(db_obj)
        session.commit()

