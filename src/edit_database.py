import sqlalchemy

from server import db
from server.main.modals import User, SpotifyUser, Playlist
from argon2 import PasswordHasher, Type


def clear_db():
    pList = Playlist.query.all()
    uList = User.query.all()
    sList = SpotifyUser.query.all()

    for p in pList:
        db.session.delete(p)
        db.session.commit()

    for u in uList:
        db.session.delete(u)
        db.session.commit()

    for s in sList:
        db.session.delete(s)
        db.session.commit()


def create_user():
    password: str = "default"
    username: str = "default"

    # Set to use the ID harsher
    ph = PasswordHasher(type=Type.ID)
    password_hash = ph.hash(password)

    try:
        user = User(username=username, password_hash=password_hash)
        db.session.add(user)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        print("The user already exists")


def create_playlist():
    try:
        spotify_user = SpotifyUser(spotify_user_id="test", oauth_token="Kuchen")
        db.session.add(spotify_user)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        print("The spotify user already exists")

    try:
        users = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == "test").first()
        spotify_playlist = Playlist(spotify_id="2w8QXdDhuMc3lcUX9J1Bca", spotify_user=users.id)
        db.session.add(spotify_playlist)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        print("The playlist already exists")


create_user()
