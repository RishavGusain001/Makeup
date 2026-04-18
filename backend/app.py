# backend/app.py - Main Flask Application v2

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

app.config['SECRET_KEY']         = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['MYSQL_HOST']         = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER']         = os.getenv('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD']     = os.getenv('MYSQL_PASSWORD', '')
app.config['MYSQL_DB']           = os.getenv('MYSQL_DB', 'makeup_artist_db')
app.config['UPLOAD_FOLDER']      = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

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
    app.run(debug=True, port=5000)
