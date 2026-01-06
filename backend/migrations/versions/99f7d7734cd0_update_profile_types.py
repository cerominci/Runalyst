"""update profile types

Revision ID: 99f7d7734cd0
Revises: 4ad289092727
Create Date: 2026-01-06 18:24:28.779227

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99f7d7734cd0'
down_revision: Union[str, Sequence[str], None] = '4ad289092727'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Define Enums
    gender_enum = sa.Enum('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', name='gender')
    experience_enum = sa.Enum('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE', name='experiencelevel')
    goal_enum = sa.Enum('WEIGHT_LOSS', 'IMPROVE_FITNESS', 'MARATHON_TRAINING', 'SPEED_IMPROVEMENT', 'STRESS_RELIEF', 'SOCIAL_RUNNING', name='runninggoal')

    # Create Enums if they don't exist
    gender_enum.create(op.get_bind(), checkfirst=True)
    experience_enum.create(op.get_bind(), checkfirst=True)
    goal_enum.create(op.get_bind(), checkfirst=True)

    # Alter columns with explicit casting using postgresql_using
    op.alter_column('profiles', 'gender',
               existing_type=sa.VARCHAR(length=50),
               type_=gender_enum,
               existing_nullable=True,
               postgresql_using='gender::gender')
    op.alter_column('profiles', 'experience_level',
               existing_type=sa.VARCHAR(length=100),
               type_=experience_enum,
               existing_nullable=True,
               postgresql_using='experience_level::experiencelevel')
    op.alter_column('profiles', 'running_goal',
               existing_type=sa.VARCHAR(length=255),
               type_=goal_enum,
               existing_nullable=True,
               postgresql_using='running_goal::runninggoal')
    
    # Cast has_injuries from VARCHAR to BOOLEAN
    # We need a USING clause to handle "true"/"false" strings or similar if data exists.
    # Assuming standard boolean-like strings or nulls.
    op.alter_column('profiles', 'has_injuries',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.Boolean(),
               existing_nullable=True,
               postgresql_using='has_injuries::boolean')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('profiles', 'has_injuries',
               existing_type=sa.Boolean(),
               type_=sa.VARCHAR(length=255),
               existing_nullable=True)
    
    # For Enums, we revert to VARCHAR. PostgreSQL doesn't automatically drop the types.
    # We might want to keep the types or drop them. Typically in downgrade we just alter column back.
    
    op.alter_column('profiles', 'running_goal',
               existing_type=sa.Enum('WEIGHT_LOSS', 'IMPROVE_FITNESS', 'MARATHON_TRAINING', 'SPEED_IMPROVEMENT', 'STRESS_RELIEF', 'SOCIAL_RUNNING', name='runninggoal'),
               type_=sa.VARCHAR(length=255),
               existing_nullable=True)
    op.alter_column('profiles', 'experience_level',
               existing_type=sa.Enum('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE', name='experiencelevel'),
               type_=sa.VARCHAR(length=100),
               existing_nullable=True)
    op.alter_column('profiles', 'gender',
               existing_type=sa.Enum('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', name='gender'),
               type_=sa.VARCHAR(length=50),
               existing_nullable=True)

    # Optional: Drop the types
    sa.Enum(name='gender').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='experiencelevel').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='runninggoal').drop(op.get_bind(), checkfirst=True)
