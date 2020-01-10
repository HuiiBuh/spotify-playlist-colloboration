from flask import Flask
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

import server.admin
import server.api
from server.config import Config
from server.keys import KEYS
from server.spotify import Spotify, SpotifyAppInfo

# create flask app
app = Flask(__name__)

# configure the app from the object
app.config.from_object(Config)

socket_io = SocketIO(app)

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

spotify_info = SpotifyAppInfo(KEYS.SPOTIFY_CLIENT_ID, KEYS.SPOTIFY_CLIENT_SECRET, KEYS.SPOTIFY_SCOPES,
                              KEYS.SPOTIFY_REDIRECT_URI, KEYS.SPOTIFY_STATE)
spotify = Spotify(spotify_info)

# import the modal at the end so the db the db modals depend on are already created
import server.routes
from server.main.routes import mod as main_mod
from server.main import modals
from server.admin.routes import mod as admin_mod
from server.api.apis import mod as api_mod
from server.cors_proxy.routes import mod as cors_proxy_mod

app.register_blueprint(admin_mod, url_prefix="/admin")
app.register_blueprint(api_mod, url_prefix="/api")
app.register_blueprint(cors_proxy_mod, url_prefix="/proxy")
app.register_blueprint(main_mod)
