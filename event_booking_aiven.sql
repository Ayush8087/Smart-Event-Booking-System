-- Smart Event Booking System - Aiven MySQL Schema
-- Run this in your Aiven MySQL SQL Editor

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  location VARCHAR(150) NOT NULL,
  date DATETIME NOT NULL,
  total_seats INT UNSIGNED NOT NULL,
  available_seats INT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  img VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_date (date),
  INDEX idx_events_location (location)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mobile VARCHAR(25) NULL,
  quantity INT UNSIGNED NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  CONSTRAINT fk_bookings_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_bookings_event (event_id),
  INDEX idx_bookings_status (status)
);

-- Sample seed data
INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img)
VALUES
  ('Tech Conference 2025', 'Annual tech event with speakers and workshops', 'San Francisco', DATE_ADD(NOW(), INTERVAL 30 DAY), 300, 300, 199.00, NULL),
  ('Music Festival', 'Outdoor live performances', 'Austin', DATE_ADD(NOW(), INTERVAL 45 DAY), 500, 500, 99.00, NULL),
  ('Design Meetup', 'Talks on UX/UI trends', 'New York', DATE_ADD(NOW(), INTERVAL 14 DAY), 120, 120, 49.00, NULL);

