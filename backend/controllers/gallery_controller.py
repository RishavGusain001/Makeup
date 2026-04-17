# backend/controllers/gallery_controller.py - Gallery Management

import os
import uuid
from flask import jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models.db import get_db

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_all_images():
    """Get all gallery images, optionally filtered by category (public)."""
    db = get_db()
    cursor = db.cursor()

    category = request.args.get('category')
    if category:
        cursor.execute("SELECT * FROM gallery WHERE category = %s ORDER BY created_at DESC", (category,))
    else:
        cursor.execute("SELECT * FROM gallery ORDER BY created_at DESC")

    images = cursor.fetchall()
    for img in images:
        if img.get('created_at'):
            img['created_at'] = str(img['created_at'])
    return jsonify({'images': images}), 200

def upload_image(current_user_id):
    """Upload a new gallery image (admin only)."""
    if 'image' not in request.files:
        return jsonify({'message': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'message': 'File type not allowed. Use PNG, JPG, JPEG, GIF, or WEBP'}), 400

    # Generate unique filename to avoid conflicts
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(filepath)

    category = request.form.get('category', 'other')
    caption = request.form.get('caption', '')
    image_url = f"/api/gallery/image/{unique_filename}"

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO gallery (image_url, category, caption) VALUES (%s, %s, %s)",
        (image_url, category, caption)
    )

    return jsonify({
        'message': 'Image uploaded successfully',
        'id': cursor.lastrowid,
        'image_url': image_url
    }), 201

def serve_image(filename):
    """Serve an uploaded image file."""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

def delete_image(current_user_id, image_id):
    """Delete a gallery image (admin only)."""
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM gallery WHERE id = %s", (image_id,))
    image = cursor.fetchone()

    if not image:
        return jsonify({'message': 'Image not found'}), 404

    # Delete physical file
    filename = image['image_url'].split('/')[-1]
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    cursor.execute("DELETE FROM gallery WHERE id = %s", (image_id,))
    return jsonify({'message': 'Image deleted successfully'}), 200
