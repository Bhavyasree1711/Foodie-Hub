-- Restaurant Management System Database Schema
-- Run this file to set up the database


-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
  phone VARCHAR(15),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  image VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  is_veg BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method ENUM('cash', 'online', 'card') DEFAULT 'cash',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  delivery_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  food_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- Insert Default Admin User (password: admin123)
INSERT IGNORE INTO users (name, email, password, role)
VALUES ('Admin', 'admin@restaurant.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert Default Categories
INSERT IGNORE INTO categories (name, description) VALUES
('Starters', 'Delicious appetizers to start your meal'),
('Main Course', 'Hearty and fulfilling main dishes'),
('Desserts', 'Sweet treats to end your meal'),
('Drinks', 'Refreshing beverages'),
('Pizza', 'Freshly baked pizzas'),
('Burgers', 'Juicy gourmet burgers');

-- Insert Sample Food Items
INSERT IGNORE INTO food_items (name, description, price, category_id, image, is_veg, rating) VALUES
('Veg Spring Rolls', 'Crispy rolls stuffed with fresh vegetables', 120.00, 1, 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=280&fit=crop&auto=format', TRUE, 4.2),
('Chicken Tikka', 'Marinated chicken grilled to perfection', 280.00, 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=280&fit=crop&auto=format', FALSE, 4.5),
('Paneer Butter Masala', 'Creamy cottage cheese in rich tomato gravy', 220.00, 2, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=280&fit=crop&auto=format', TRUE, 4.4),
('Butter Chicken', 'Classic North Indian butter chicken curry', 320.00, 2, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=280&fit=crop&auto=format', FALSE, 4.7),
('Biryani', 'Aromatic basmati rice with spices and meat', 350.00, 2, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=280&fit=crop&auto=format', FALSE, 4.8),
('Dal Makhani', 'Slow cooked black lentils in butter gravy', 180.00, 2, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=280&fit=crop&auto=format', TRUE, 4.3),
('Gulab Jamun', 'Soft milk-solid dumplings in sugar syrup', 80.00, 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTrkSTYkhjRV2wggrSj3W1q_RdzdJIA8aT2w&s', TRUE, 4.6),
('Chocolate Brownie', 'Warm fudgy brownie with vanilla ice cream', 150.00, 3, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=280&fit=crop&auto=format', TRUE, 4.5),
('Mango Lassi', 'Sweet yogurt drink with fresh mango', 80.00, 4, 'https://images.unsplash.com/photo-1527549993586-dff825b37782?w=400&h=280&fit=crop&auto=format', TRUE, 4.4),
('Cold Coffee', 'Chilled coffee blended with ice cream', 120.00, 4, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=280&fit=crop&auto=format', TRUE, 4.3),
('Margherita Pizza', 'Classic tomato sauce with mozzarella', 299.00, 5, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=280&fit=crop&auto=format', TRUE, 4.2),
('Chicken BBQ Pizza', 'Tangy BBQ sauce with grilled chicken', 399.00, 5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=280&fit=crop&auto=format', FALSE, 4.6),
('Veg Burger', 'Crispy patty with fresh veggies', 149.00, 6, 'https://images.unsplash.com/photo-1550950158-d0d960dff596?w=400&h=280&fit=crop&auto=format', TRUE, 4.0),
('Zinger Burger', 'Spicy crispy chicken burger', 199.00, 6, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=280&fit=crop&auto=format', FALSE, 4.5);
