from sqlalchemy.orm import Session

class LaporanService:

    def laporan_penjualan(self, db: Session):
        pass

    def laporan_pembelian(self, db: Session):
        pass

    def laba_rugi(self, db: Session):
        pass


laporan_service = LaporanService()