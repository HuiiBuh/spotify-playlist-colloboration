from flask import render_template

from server import app


@app.errorhandler(404)
def page_not_found(*args):
    return render_template('404.html', title="404 - Page not found"), 404
