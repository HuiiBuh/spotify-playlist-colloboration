from flask import render_template
from flask_login import login_required

from server import app


@app.errorhandler(404)
@login_required
def page_not_found(*args):
    return render_template('404.html', title="404 - Page not found"), 404
