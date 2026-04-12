from sqlalchemy.orm import Session
from app.models.user import User
from sqlalchemy.orm import joinedload

def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, *, email: str, hashed_password: str) -> User:
    db_obj = User(
        email=email,
        hashed_password=hashed_password,
        auth_provider="local"
    )
    db.add(db_obj)
    return db_obj

def update_user(db: Session, *, db_obj: User, obj_in: dict) -> User:
    for field in obj_in:
        if hasattr(db_obj, field):
            setattr(db_obj, field, obj_in[field])

    db.add(db_obj)
    return db_obj

def delete_user(db: Session, *, db_obj: User) -> User:
    db.delete(db_obj)
    return db_obj

def get_user_with_profile(db: Session, user_id: int) -> User | None:
    return (
        db.query(User)
        .options(joinedload(User.profile))
        .filter(User.id == user_id)
        .first()
    )
