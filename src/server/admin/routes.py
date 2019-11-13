from argon2 import PasswordHasher, Type
from flask import Blueprint, request, render_template, redirect, url_for
from flask_login import login_required, current_user

from server import db
from server.admin.admin_functions import display_all_spotify_users, display_spotify_user_playlists, display_user, \
    display_all_users
from server.admin.forms import ChangePasswordForm
from server.main.modals import User

mod = Blueprint("admin", __name__, template_folder='templates')


@mod.route("/spotify-users")
@login_required
def spotify_users() -> render_template:
    """
    Display one or all spotify users depending on the args in the url
    :return:
    """

    if not current_user.is_admin:
        return render_template("authorisation_error.html", title="403")

    # Get the spotify id of a use in a url
    spotify_user_id = request.args.get("spotify-user-id")

    # Check if a use id is present in the url
    if spotify_user_id:
        return display_spotify_user_playlists(spotify_user_id)
    else:
        return display_all_spotify_users()


@mod.route("/users")
@login_required
def users() -> render_template:
    """
    Display the users or one user
    :return: A rendered template
    """

    if not current_user.is_admin:
        return render_template("authorisation_error.html", title="403")

    # Get the user-id from the url
    user_id = request.args.get("user-id")

    # Check if a user id is given in the url
    if user_id:
        return display_user(user_id)

    return display_all_users()


@mod.route("/user/change_password", methods=["POST", "GET"])
def edit_user() -> redirect:
    """
    Edit the user password
    :return: a redirect to the user page
    """

    if not current_user.is_admin:
        return render_template("authorisation_error.html", title="403")

    # Get the user-id from the url
    user_id = request.args.get("user-id")

    # Check if a user id is given in the url
    if not user_id:
        return "No user id was provided"

    if current_user.id != int(user_id):
        return render_template("authorisation_error.html", title="403")

    # Create a password hasher
    ph = PasswordHasher(type=Type.ID)
    form = ChangePasswordForm()

    if form.confirmed_new_password.data == (None or "") and form.new_password.data == (None or "") \
            and form.current_password.data == (None or ""):
        return "You did not input all the required forms"

    # checks if all relevant data filed have been filled
    if current_user.check_password(form.current_password.data):

        if form.new_password.data == form.confirmed_new_password.data:
            current_user.password_hash = ph.hash(form.confirmed_new_password.data)
            db.session.commit()
            return redirect(url_for("admin.users") + f"user-id={current_user.id}")
        else:
            return "The passwords did not match"
    else:
        return "You provided the wrong password"


@mod.route("/user/add", methods=["POST", "GET"])
@login_required
def add_user() -> redirect:
    """
    Add a new user
    :return: a redirect to the user page
    """

    if not current_user.is_admin:
        return render_template("authorisation_error.html", title="403")

    # Create a password hasher
    ph = PasswordHasher(type=Type.ID)

    # Hash the password
    password = ph.hash(request.form["password"])
    username = request.form["username"]

    # Check if the user should be a admin
    if "is_admin" in request.form:
        admin = True
    else:
        admin = False

    # Check if the username already exists and do nothing if the user exists
    if User.query.filter(User.username == username).first():
        return redirect(url_for("admin.users"))

    # Create the neu user and add it into the database
    user = User(username=username, password_hash=password, is_admin=admin)
    db.session.add(user)
    db.session.commit()

    return redirect(url_for("admin.users"))
