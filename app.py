from flask import Flask, render_template, request, jsonify, send_file
from chat import get_response

from werkzeug.middleware.proxy_fix import ProxyFix

import logging
from logging.handlers import RotatingFileHandler

import os

app = Flask(__name__)   # 👈 create app FIRST

app.config['TEMPLATES_AUTO_RELOAD'] = True

app.jinja_env.auto_reload = True

app.wsgi_app = ProxyFix(app.wsgi_app)

# 👇 THEN configure logging

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
log_path = os.path.join(BASE_DIR, "logs", "flask_app.log")
log_dir = os.path.join(BASE_DIR, "logs")
os.makedirs(log_dir, exist_ok=True)

log_path = os.path.join(log_dir, "flask_app.log")

handler = RotatingFileHandler(
    log_path,
    maxBytes=100000,
    backupCount=3
)

formatter = logging.Formatter(
    '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)

handler.setFormatter(formatter)

handler.setLevel(logging.INFO)

root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(handler)

app.logger.handlers.clear()        # remove default handlers
app.logger.propagate = True       # prevent sending to Apache error.log

app.logger.info("App startup")


if not app.logger.handlers:
    app.logger.addHandler(handler)

app.logger.setLevel(logging.INFO)


@app.before_request
def log_request():
    app.logger.info(f"{request.remote_addr} {request.method} {request.path}")


@app.get("/")
def index_get():
    return render_template("base.html")

@app.route('/resume_get')
def resume_get():
    # Renders another html page
    return render_template("MichaelSteffeeResume.html")

@app.route('/photo_get')
def photo_get():
    # Renders another html page
    return render_template("photos.html")

@app.route('/download-resume')
def download_resume():
    path = os.path.join(app.root_path, 'static', 'MichaelSteffeeResume.pdf')
    return send_file(path, as_attachment=True)

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    # TODO: check it text is valid
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
