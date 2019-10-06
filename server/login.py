from flask_wtf import FlaskForm
from flask_login import UserMixin
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired

from server.main import login_manager, db


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')


class User(UserMixin, db.Model):
    pass


@login_manager.user_loader
def load_user(user_id):
    pass
