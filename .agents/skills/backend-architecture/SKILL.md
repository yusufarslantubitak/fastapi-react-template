---
name: backend-architecture
description: Backend architecture guidelines using the Controller-Service-Repository (CSR) pattern and modular DTO layout.
---

# Backend Architecture: Controller-Service-Repository (CSR)

The backend is structured into four strict layers to isolate concerns, maintain type safety, and simplify testing.

---

## 1. Controller / Route Layer (`app/api/routes/`)
- **Responsibility**: Exposes HTTP endpoints, defines OpenAPI schemas, deserializes inputs, and serializes outputs.
- **Rules**:
  - Do NOT perform database queries or direct writes (e.g., `session.exec()`, `session.add()`, `session.delete()`).
  - Do NOT write business or validation logic.
  - Invoke methods from the **Service Layer** and pass the dependency-injected database session (`SessionDep`) and user object (`CurrentUser`).
  - Example (`app/api/routes/items.py`):
    ```python
    @router.get("/{id}", response_model=ItemPublic)
    def read_item(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
        return ItemService.get_item_by_id(session=session, current_user=current_user, id=id)
    ```

---

## 2. Service Layer (`app/services/`)
- **Responsibility**: Core business logic, transaction orchestration, domain validations, and access authorization checks.
- **Rules**:
  - Business validations (e.g., checking if the user is authorized to edit the entity, or if limits have been exceeded) must live here.
  - Raise semantic exceptions (e.g., `HTTPException(status_code=403, detail="Not enough permissions")`) from this layer.
  - Delegate data querying and updates to the **Repository Layer**.
  - Example (`app/services/item_service.py`):
    ```python
    class ItemService:
        @staticmethod
        def get_item_by_id(session: Session, current_user: User, id: uuid.UUID) -> Item:
            item = item_repository.get_by_id(session, id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            if not current_user.is_superuser and (item.owner_id != current_user.id):
                raise HTTPException(status_code=403, detail="Not enough permissions")
            return item
    ```

---

## 3. Repository Layer (`app/repositories/`)
- **Responsibility**: Direct interactions with the SQLModel / SQLAlchemy database session.
- **Rules**:
  - Inherit from `BaseRepository` for generic, type-safe CRUD operations.
  - Instantiate and export a singleton repository instance (e.g., `item_repository = ItemRepositoryClass()`) for ease of use.
  - Custom SQL queries or complex filters must live in the specific subclass methods.
  - Example (`app/repositories/item_repository.py`):
    ```python
    from app.repositories.base_repository import BaseRepository

    class ItemRepositoryClass(BaseRepository[Item, ItemCreate, ItemUpdate]):
        def __init__(self) -> None:
            super().__init__(Item)

        # Custom SQLModel query
        def list_by_owner(self, session: Session, owner_id: uuid.UUID) -> Sequence[Item]:
            statement = select(Item).where(Item.owner_id == owner_id)
            return session.exec(statement).all()

    item_repository = ItemRepositoryClass()
    ```

## 4. Models Layer (`app/models/`)
- **Responsibility**: Defines database entities and API data transfer validation schemas.
- **Sub-divisions**:
  - **Entities (`app/models/entities.py`)**: Defines SQLModel database tables representing core domain objects (e.g. `User`, `Item`).
  - **DTOs (`app/models/dto/`)**: Contains pure validation schemas separated into domain files (e.g., `app/models/dto/user.py`, `app/models/dto/item.py`) and aggregated in `app/models/dto/__init__.py`.
  - **Export Aggregation (`app/models/__init__.py`)**: Exposes everything from both DTOs and Entities to maintain unified imports from `app.models`.

## 5. Base Repository (`app/repositories/base_repository.py`)
- Provides 100% type-safe generic CRUD methods:
  - `get_by_id(session, id)`
  - `list_all(session, skip, limit)`
  - `count_all(session)`
  - `create(session, obj_in, **kwargs)`
  - `update(session, db_obj, obj_in)`
  - `delete(session, db_obj)`
