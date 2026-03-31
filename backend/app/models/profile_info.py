from sqlalchemy import String, Integer, Float, ForeignKey, Boolean, Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.user import User
from app.core.enums import Gender, ExperienceLevel, RunningGoal


class ProfileInfo(Base):
    __tablename__ = "profiles"

    # Links to User.id which is an Integer
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gender: Mapped[Gender | None] = mapped_column(SQLAlchemyEnum(Gender), nullable=True)
    experience_level: Mapped[ExperienceLevel | None] = mapped_column(SQLAlchemyEnum(ExperienceLevel), nullable=True)
    running_goal: Mapped[RunningGoal | None] = mapped_column(SQLAlchemyEnum(RunningGoal), nullable=True)
    has_injuries: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # Relationship back to the User
    user: Mapped["User"] = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<Profile(user_id={self.user_id})>"