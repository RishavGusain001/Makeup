-- ============================================
-- Makeup Artist Booking Website - Full Schema v2
-- ============================================

CREATE DATABASE IF NOT EXISTS makeup_artist_db;
USE makeup_artist_db;

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('bridal','party','editorial','natural','other') DEFAULT 'other',
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending','accepted','rejected','completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    UNIQUE KEY no_double_booking (booking_date, booking_time)
);

INSERT IGNORE INTO admin (username, password) VALUES
('admin','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2oa9fSj4.u');

INSERT IGNORE INTO services (name, price, description, duration) VALUES
('Bridal Makeup',8500.00,'Complete bridal look with long-lasting formula, includes trial session','3-4 hours'),
('Party Makeup',3500.00,'Glamorous party look perfect for any celebration','1.5-2 hours'),
('Engagement Makeup',5000.00,'Elegant look for your special engagement ceremony','2-3 hours'),
('Natural / Everyday Makeup',1500.00,'Light, fresh-faced natural makeup for daily wear or photoshoots','1 hour'),
('Editorial / Photoshoot',4000.00,'High-fashion editorial looks for professional photography','2-3 hours'),
('Mehndi / Haldi Makeup',4500.00,'Vibrant and festive look for Mehndi and Haldi ceremonies','2 hours');

-- UPGRADING EXISTING DB? Run these two lines:
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id INT DEFAULT NULL AFTER id;
-- ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS fk_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
