import os

import sqlalchemy
from argon2 import PasswordHasher, Type

from server import db, KEYS
from server.main.modals import User


def create_user(username, password, admin):
    # Set to use the ID harsher
    ph = PasswordHasher(type=Type.ID)
    password_hash = ph.hash(password)

    try:
        user = User(username=username, password_hash=password_hash, is_admin=admin)
        db.session.add(user)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        print("The user already exists")


create_user(username=KEYS.DEFAULT_USER, password=KEYS.DEFAULT_USER_PASSWORD, admin=True)
print("Success")
