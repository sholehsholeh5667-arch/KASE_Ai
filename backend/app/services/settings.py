from sqlalchemy.orm import Session

from app.models.settings import Settings
from app.schemas.settings import SettingsUpdate


class SettingsService:

    # ======================================================
    # GET SETTINGS TOKO
    # ======================================================

    @staticmethod
    def get_settings(
        db: Session,
    ) -> Settings:

        settings = (
            db.query(Settings)
            .filter(Settings.id == 1)
            .first()
        )

        if settings is None:

            settings = Settings(
                id=1,
                store_name="",
                owner_name="",
                address="",
                phone="",
                email="",
                logo="",
                currency="IDR",
                tax=0,
                thermal_printer="",
                receipt_width=80,
                backup_auto=False,
                language="id",
            )

            db.add(settings)
            db.commit()
            db.refresh(settings)

        return settings


    # ======================================================
    # UPDATE SETTINGS TOKO
    # ======================================================

    @staticmethod
    def update_settings(
        db: Session,
        data: SettingsUpdate,
    ) -> Settings:

        settings = (
            db.query(Settings)
            .filter(Settings.id == 1)
            .first()
        )

        if settings is None:

            settings = Settings(
                id=1,
            )

            db.add(settings)

        update_data = data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():

            setattr(
                settings,
                field,
                value,
            )

        db.commit()
        db.refresh(settings)

        return settings