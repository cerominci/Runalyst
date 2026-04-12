from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from sqlalchemy import Column, String



class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(
        Integer, 
        primary_key=True, 
        index=True,
        autoincrement=True
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )

    apple_sub: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True
    )
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    auth_provider: Mapped[str] = mapped_column(String(32), nullable=False, server_default="local")
    
    google_sub: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)

    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        nullable=False, 
        server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now()
    )

    runs = relationship("Run", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
