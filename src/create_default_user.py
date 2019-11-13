import sqlalchemy
from argon2 import PasswordHasher, Type

from server import db, KEYS
from server.main.modals import User


def create_user(username, password):
    # Set to use the ID harsher
    ph = PasswordHasher(type=Type.ID)
    password_hash = ph.hash(password)

    try:
        user = User(username=username, password_hash=password_hash, is_admin=True, is_root=True)
        db.session.add(user)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        user = User.query.filter(User.username == username).first()
        db.session.delete(user)
        db.session.commit()
        create_user(username=KEYS.DEFAULT_USER, password=KEYS.DEFAULT_USER_PASSWORD)
        print("The user already exists")


if __name__ == "__main__":
    create_user(username=KEYS.DEFAULT_USER, password=KEYS.DEFAULT_USER_PASSWORD)
    print("Success")
