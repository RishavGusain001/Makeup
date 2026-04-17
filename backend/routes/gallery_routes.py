# backend/routes/gallery_routes.py

from flask import Blueprint
from controllers.gallery_controller import (
    get_all_images, upload_image, delete_image, serve_image
)
from models.auth_middleware import token_required

gallery_bp = Blueprint('gallery', __name__)

# Public routes
gallery_bp.route('/', methods=['GET'])(get_all_images)
gallery_bp.route('/image/<filename>', methods=['GET'])(serve_image)

# Admin-protected routes
gallery_bp.route('/', methods=['POST'])(token_required(upload_image))
gallery_bp.route('/<int:image_id>', methods=['DELETE'])(token_required(delete_image))
