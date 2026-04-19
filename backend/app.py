# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

load_dotenv()

# ── Validate required env vars on startup ──────────────
required_vars = ['SECRET_KEY', 'MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DB']
missing = [v for v in required_vars if not os.getenv(v)]
if missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

app = Flask(__name__)

# ── CORS ───────────────────────────────────────────────
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=allowed_origins)

# ── Config — NO hardcoded fallbacks for secrets ────────
app.config['SECRET_KEY']         = os.getenv('SECRET_KEY')
app.config['MYSQL_HOST']         = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER']         = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD']     = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB']           = os.getenv('MYSQL_DB')
app.config['MYSQL_PORT']         = int(os.getenv('MYSQL_PORT', 3306))
app.config['UPLOAD_FOLDER']      = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ── Logging ────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

# ── Global error handlers ──────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    app.logger.error(f"Server error: {e}")
    return jsonify({'message': 'Internal server error'}), 500

# ── Blueprints ─────────────────────────────────────────
from routes.auth_routes    import auth_bp
from routes.booking_routes import booking_bp
from routes.service_routes import service_bp
from routes.gallery_routes import gallery_bp
from routes.client_routes  import client_bp

app.register_blueprint(auth_bp,    url_prefix='/api/auth')
app.register_blueprint(booking_bp, url_prefix='/api/bookings')
app.register_blueprint(service_bp, url_prefix='/api/services')
app.register_blueprint(gallery_bp, url_prefix='/api/gallery')
app.register_blueprint(client_bp,  url_prefix='/api/client')

if __name__ == '__main__':
    # This block only runs in local dev — production uses Gunicorn
    app.run(debug=True, port=5000)