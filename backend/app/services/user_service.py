from sqlmodel import Session

from app.models import User, UserCreate, UserUpdate
from app.repositories.user_repository import user_repository


class UserService:
    @staticmethod
    def authenticate(session: Session, email: str, password: str) -> User | None:
        return user_repository.authenticate(session=session, email=email, password=password)

    @staticmethod
    def create_user(session: Session, user_create: UserCreate) -> User:
        return user_repository.create_user(session=session, user_create=user_create)

    @staticmethod
    def update_user(session: Session, db_user: User, user_in: UserUpdate) -> User:
        return user_repository.update_user(session=session, db_user=db_user, user_in=user_in)

    @staticmethod
    def get_user_by_email(session: Session, email: str) -> User | None:
        return user_repository.get_by_email(session=session, email=email)
