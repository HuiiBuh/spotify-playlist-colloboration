from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

import server.admin
import server.api

from server.admin.routes import mod
from server.api.routes import mod

from server.config import Config

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

# import the modal at the end so the db the modals depend on are already created
from server.main.routes import mod
from server.main import modals

app.register_blueprint(admin.routes.mod, url_prefix="/admin")
app.register_blueprint(api.routes.mod, url_prefix="/api")
app.register_blueprint(main.routes.mod)
