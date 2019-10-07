from server import db
from server.modals import User
from argon2 import PasswordHasher, Type

password = "default"
username = "default"

# Set to use the ID hasher
ph = PasswordHasher(type=Type.ID)
password_hash = ph.hash(password)

a = ph.verify(password_hash, "assword")

user = User(username=username, password_hash=password_hash)
db.session.add(user)
db.session.commit()

users = User.query.all()
