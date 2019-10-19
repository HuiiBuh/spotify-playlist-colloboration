from flask import Blueprint
from flask_login import login_required

mod = Blueprint("admin", __name__)


@mod.route("/")
@login_required
def admin_page():
    return "Under construction"
