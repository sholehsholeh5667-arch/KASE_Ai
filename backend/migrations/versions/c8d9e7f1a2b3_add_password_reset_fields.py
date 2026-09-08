"""add password reset fields

Revision ID: c8d9e7f1a2b3
Revises: b426e3195ec8
Create Date: 2026-08-21 13:05:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c8d9e7f1a2b3"

down_revision: Union[str, Sequence[str], None] = "7cfb0587f4f9"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "reset_token_hash",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "reset_token_expires",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )

    op.create_index(
        "ix_users_reset_token_hash",
        "users",
        ["reset_token_hash"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_users_reset_token_hash",
        table_name="users",
    )

    op.drop_index(
        "ix_users_email",
        table_name="users",
    )

    op.drop_column(
        "users",
        "reset_token_expires",
    )

    op.drop_column(
        "users",
        "reset_token_hash",
    )

    op.drop_column(
        "users",
        "email",
    )