from logging.config import fileConfig

from sqlalchemy import pool
from alembic import context

from app.core.database import Base, engine

from app.models.user import User
from app.models.barang import Barang
from app.models.kategori import Kategori
from app.models.supplier import Supplier
from app.models.pelanggan import Pelanggan
from app.models.pembelian import Pembelian
from app.models.detail_pembelian import DetailPembelian
from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan
from app.models import *
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    with engine.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()