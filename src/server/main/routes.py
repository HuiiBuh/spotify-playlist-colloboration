from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user, logout_user, login_user

from server.main.forms import LoginForm
from server.main.modals import User, Playlist

mod = Blueprint("main", __name__, template_folder='templates')


@mod.route("/")
@login_required
def home():
    playlist_id = request.args.get('playlist-id')

    if not playlist_id:
        return redirect("/404")

    spotify_playlist = Playlist.query.filter(Playlist.spotify_id == playlist_id).first()

    if not spotify_playlist:
        return redirect("404")

    return render_template("index.html", title="Home", playlist_id=playlist_id)


@mod.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    form = LoginForm()

    # checks if all relevant data filed have been filled
    if form.validate_on_submit():
        # get the user that logged in
        user = User.query.filter_by(username=form.username.data).first()

        # todo remember username
        # if the user does not exist or has the wrong password
        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password")
            return redirect(url_for("main.login"))

        # login the user
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for("main.home"))

    if request.method == "POST":
        flash("You missed to fill some fields")
        return render_template('login.html', title='Sign In', form=form)

    return render_template('login.html', title='Sign In', form=form)


@mod.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.home'))
