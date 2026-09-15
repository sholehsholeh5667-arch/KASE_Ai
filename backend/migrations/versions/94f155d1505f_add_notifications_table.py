"""add notifications table

Revision ID: 94f155d1505f
Revises: c8d9e7f1a2b3
Create Date: 2026-09-14 00:40:42.605359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "94f155d1505f"
down_revision: Union[str, Sequence[str], None] = "c8d9e7f1a2b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "notifications",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "judul",
            sa.String(length=150),
            nullable=False,
        ),
        sa.Column(
            "pesan",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "tipe",
            sa.String(length=30),
            nullable=False,
            server_default="info",
        ),
        sa.Column(
            "dibaca",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_notifications_user_id",
        "notifications",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_notifications_user_id",
        table_name="notifications",
    )

    op.drop_table("notifications")