from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlmodel import SQLModel, Session, create_engine, delete

from app.api.deps import get_db
from app.core.config import settings
from app.core.db import init_db
from app.main import app
from app.models import Item, User
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import get_superuser_token_headers

# Configure test database URIs using make_url for safety
db_url = make_url(str(settings.SQLALCHEMY_DATABASE_URI))
test_db_url = db_url.set(database="app_test")

test_engine = create_engine(test_db_url)


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session]:
    # Connect to the default app database to create the test database if it doesn't exist
    default_engine = create_engine(db_url, isolation_level="AUTOCOMMIT")
    with default_engine.connect() as conn:
        try:
            conn.execute(text("CREATE DATABASE app_test"))
        except Exception:
            pass
    default_engine.dispose()

    # Create tables in the test database
    SQLModel.metadata.create_all(test_engine)

    # Dependency override for fastapi dependency injection
    def override_get_db() -> Generator[Session]:
        with Session(test_engine) as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    # Initialize and clean up test database session
    with Session(test_engine) as session:
        init_db(session)
        yield session
        statement = delete(Item)
        session.exec(statement)
        statement = delete(User)
        session.exec(statement)
        session.commit()

    # Clear dependency overrides after session tests complete
    app.dependency_overrides.clear()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )
