import argon2
from argon2 import PasswordHasher, Type
from flask_login import UserMixin

from server import db, login

user_playlists = db.Table(
    "playlist_user",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column("playlist_id", db.Integer, db.ForeignKey("playlist.id"))
)


class User(db.Model, UserMixin):
    """
    The User Model
    """
    id = db.Column(db.Integer, primary_key=True)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_root = db.Column(db.Boolean, default=False)
    username = db.Column(db.String(64), nullable=False, index=True, unique=True)
    password_hash = db.Column(db.Text, nullable=False)
    playlists = db.relationship("Playlist", secondary=user_playlists, backref=db.backref("users", lazy="joined"))

    __mapper_args__ = {"order_by": username}

    def set_password(self, password: str):
        """
        Hash the password and then set it as the user password
        :param password: The password of the user
        :return:
        """
        ph = PasswordHasher(type=Type.ID)
        password_hash = ph.hash(password)
        self.password_hash = password_hash

    def check_password(self, password: str) -> bool:
        """
        Check the passed password
        :param password: The clear password as string
        :return: If the password is correct
        """
        ph = PasswordHasher(type=Type.ID)
        try:
            same = ph.verify(self.password_hash, password)
        except argon2.exceptions.VerifyMismatchError:
            same = False

        return same

    def __repr__(self):
        return f"{self.username}"


@login.user_loader
def load_user(user_id: int):
    return User.query.get(int(user_id))


class SpotifyUser(db.Model):
    """
    Spotify user model, that stores the oauth key for every user
    """
    id = db.Column(db.Integer, primary_key=True)
    spotify_user_id = db.Column(db.String(64), nullable=False, unique=True)
    refresh_token = db.Column(db.Text)
    oauth_token = db.Column(db.Text)
    activated_at = db.Column(db.BigInteger)
    playlists = db.relationship('Playlist', backref='SpotifyUser', lazy="joined", cascade="all, delete, delete-orphan",
                                passive_deletes=True)

    __mapper_args__ = {"order_by": id}


class Playlist(db.Model):
    """
    Connects the spotify user with the playlist
    """
    id = db.Column(db.Integer, primary_key=True)
    spotify_id = db.Column(db.String(length=64), nullable=False, unique=True)
    spotify_user = db.Column(db.Integer, db.ForeignKey(SpotifyUser.id, ondelete="CASCADE"))
    max_song_length = db.Column(db.Integer, nullable=False, default=0)

    __mapper_args__ = {"order_by": id}
