import sqlalchemy
from argon2 import PasswordHasher, Type

from server import db
from server.main.modals import User, SpotifyUser, Playlist


def clear_db():
    p_list = Playlist.query.all()
    u_list = User.query.all()
    s_list = SpotifyUser.query.all()

    for p in p_list:
        db.session.delete(p)
        db.session.commit()

    for u in u_list:
        db.session.delete(u)
        db.session.commit()

    for s in s_list:
        db.session.delete(s)
        db.session.commit()


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


create_user(username="default", password="default", admin=True)
print("Success")
