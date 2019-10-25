import sqlalchemy
from argon2 import PasswordHasher, Type

from server import db
from server.main.modals import User, SpotifyUser, Playlist


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


def create_spotify_user():
    try:
        spotify_user = SpotifyUser(spotify_user_id="test", oauth_token="Kuchen")
        db.session.add(spotify_user)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        print("The spotify user already exists")


def create_playlist():
    try:
        spotify_user = SpotifyUser.query.filter(SpotifyUser.spotify_user_id == "z0h3f10jgq7tokoy5pj6a6vsz").first()
        user = User.query.filter(User.username == "default").first()
        spotify_playlist_1 = Playlist(spotify_id="70QAcHhCzkvkGPIidSj4wC", spotify_user=spotify_user.id, user=user.id)
        spotify_playlist_2 = Playlist(spotify_id="5rhQjP3GA9xyTCpUTDlMD7", spotify_user=spotify_user.id, user=user.id)
        db.session.add(spotify_playlist_1)
        db.session.add(spotify_playlist_2)
        db.session.commit()
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        print("The playlist already exists")


create_user(username="default", password="default", admin=True)
# create_playlist()
print("Success")
