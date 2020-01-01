import flask
import requests

from flask import Blueprint, abort
from flask_login import login_required

mod = Blueprint("proxy", __name__)

method_requests_mapping = {
    'GET': requests.get,
    'HEAD': requests.head,
    'POST': requests.post,
    'PUT': requests.put,
    'DELETE': requests.delete,
    'PATCH': requests.patch,
    'OPTIONS': requests.options,
}

@login_required
@mod.route('/<path:url>', methods=method_requests_mapping.keys())
def proxy(url):
    requests_function = method_requests_mapping[flask.request.method]

    try:
        request = requests_function(url, stream=True, params=flask.request.args)
    except requests.exceptions.MissingSchema:
        return abort(400, "Invalide URL.")
    except requests.exceptions.ConnectionError:
        return abort(404, "URL not found.")

    response = flask.Response(flask.stream_with_context(request.iter_content()),
                              content_type=request.headers['content-type'],
                              status=request.status_code)

    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
