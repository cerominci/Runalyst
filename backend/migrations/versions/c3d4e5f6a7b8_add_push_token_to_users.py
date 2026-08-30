"""add push_token to users

Revision ID: c3d4e5f6a7b8
Revises: a2b3c4d5e6f7
Create Date: 2026-08-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'c3d4e5f6a7b8'
down_revision = 'a2b3c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name='users' AND column_name='push_token'"
    )).fetchone()
    if not result:
        op.add_column(
            'users',
            sa.Column('push_token', sa.String(length=255), nullable=True)
        )


def downgrade() -> None:
    op.drop_column('users', 'push_token')
