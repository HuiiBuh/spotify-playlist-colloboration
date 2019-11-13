from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired


class AddUserForm(FlaskForm):
    """
    A Form to add new users
    """
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    is_admin = BooleanField('Admin')
    submit = SubmitField('Add user')


class ChangePasswordForm(FlaskForm):
    """
    A Form to change the password of the current user
    """
    current_password = PasswordField("Current Password", validators=[DataRequired])
    new_password = PasswordField("New Password", validators=[DataRequired])
    confirmed_new_password = PasswordField("Confirm New Password", validators=[DataRequired])
    submit = SubmitField('Change password')
