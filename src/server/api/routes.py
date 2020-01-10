from flask import Blueprint

mod = Blueprint("api", __name__)
# TODO Blueprints
from server.api.apis import *
