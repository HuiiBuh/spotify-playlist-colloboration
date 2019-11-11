import os
from flask import Flask
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

import server.admin
import server.api
from create_default_user import create_user
from server.config import Config
from server.keys import KEYS
from server.spotify import Spotify, SpotifyAppInfo, SpotifyAuthorisationToken

os.system("flask db init")
os.system("flask db migrate")
os.system("flask db upgrade")

create_user(KEYS.DEFAULT_USER, KEYS.DEFAULT_USER_PASSWORD)


# create flask app
app = Flask(__name__)
# configure the app from the object
app.config.from_object(Config)

# add the login manager
login_manager = LoginManager()
login_manager.init_app(app)

# add the db
db = SQLAlchemy(app)
migrate = Migrate(app=app, db=db)

# add the login
login = LoginManager(app=app)
login.login_message = ""
login.login_view = 'main.login'

spotify = Spotify()
spotify_info = SpotifyAppInfo(KEYS.SPOTIFY_CLIENT_ID, KEYS.SPOTIFY_CLIENT_SECRET, KEYS.SPOTIFY_SCOPES,
                              KEYS.SPOTIFY_REDIRECT_URI, KEYS.SPOTIFY_STATE)
spotify.app_information = spotify_info

state = "HuiiBuh"

# import the modal at the end so the db the modals depend on are already created
import server.routes
from server.main.routes import mod
from server.main import modals
from server.admin.routes import mod
from server.api.routes import mod

app.register_blueprint(admin.routes.mod, url_prefix="/admin")
app.register_blueprint(api.routes.mod, url_prefix="/api")
app.register_blueprint(main.routes.mod)
