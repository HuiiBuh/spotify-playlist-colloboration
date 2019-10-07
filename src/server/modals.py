import argon2
from argon2 import PasswordHasher, Type
from flask_login import UserMixin

from server import db, login


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False, index=True, unique=True)
    password_hash = db.Column(db.Text, nullable=False)

    def set_password(self, password: str):
        """
        Hash the password and then set it as the user password
        :param password: The password of the user
        :return:
        """
        ph = PasswordHasher(type=Type.ID)
        password_hash = ph.hash(password)
        self.password_hash = password_hash

    def check_password(self, password: str):
        ph = PasswordHasher(type=Type.ID)
        try:
            same = ph.verify(self.password_hash, password)
        except argon2.exceptions.VerifyMismatchError as e:
            same = False

        return same

    def __repr__(self):
        return f"{self.username}"


@login.user_loader
def load_user(id: int):
    return User.query.get(int(id))
