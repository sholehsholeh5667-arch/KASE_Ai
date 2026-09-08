from app.models.pelanggan import Pelanggan
from app.repositories.base import BaseRepository


class PelangganRepository(BaseRepository[Pelanggan]):

    def __init__(self):
        super().__init__(Pelanggan)


pelanggan_repository = PelangganRepository()