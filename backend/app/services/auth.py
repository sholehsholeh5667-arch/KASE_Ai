from sqlalchemy.orm import Session

class AuthService:

    def login(self, db: Session, username: str, password: str):
        pass

    def register(self, db: Session, data):
        pass


auth_service = AuthService()