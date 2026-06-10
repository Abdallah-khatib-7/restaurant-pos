CREATE DATABASE IF NOT EXISTS restaurant_pos;
USE restaurant_pos;

-- You, the software owner
CREATE TABLE super_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant applications (before approval)
CREATE TABLE restaurant_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Owner Info
  owner_name VARCHAR(100) NOT NULL,
  owner_email VARCHAR(100) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  owner_national_id VARCHAR(50) NOT NULL,

  -- Restaurant Info
  restaurant_name VARCHAR(150) NOT NULL,
  branch_name VARCHAR(150),
  restaurant_type VARCHAR(100) NOT NULL,
  cuisine_type VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  google_maps_link VARCHAR(500),
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),

  -- Operations
  seating_capacity INT NOT NULL,
  num_tables INT NOT NULL,
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  days_open VARCHAR(100) NOT NULL,
  has_delivery BOOLEAN DEFAULT FALSE,
  has_shisha BOOLEAN DEFAULT FALSE,
  has_outdoor_seating BOOLEAN DEFAULT FALSE,

  -- Staff Distribution
  num_owners INT DEFAULT 1,
  num_waiters INT NOT NULL,
  num_kitchen INT NOT NULL,
  num_delivery INT DEFAULT 0,
  total_employees INT NOT NULL,

  -- Pricing
  pricing_tier VARCHAR(50) NOT NULL,
  quoted_price DECIMAL(10,2) NOT NULL,

  -- Status
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL
);

-- Approved restaurants
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT,

  -- Identity
  restaurant_name VARCHAR(150) NOT NULL,
  branch_name VARCHAR(150),
  restaurant_type VARCHAR(100) NOT NULL,
  cuisine_type VARCHAR(100) NOT NULL,

  -- Contact
  owner_name VARCHAR(100) NOT NULL,
  owner_email VARCHAR(100) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  google_maps_link VARCHAR(500),

  -- Operations
  seating_capacity INT NOT NULL,
  num_tables INT NOT NULL,
  opening_time TIME,
  closing_time TIME,
  days_open VARCHAR(100),
  has_delivery BOOLEAN DEFAULT FALSE,
  has_shisha BOOLEAN DEFAULT FALSE,
  has_outdoor_seating BOOLEAN DEFAULT FALSE,

  -- Staff
  num_owners INT DEFAULT 1,
  num_waiters INT NOT NULL,
  num_kitchen INT NOT NULL,
  num_delivery INT DEFAULT 0,
  total_employees INT NOT NULL,

  -- Financials
  pricing_tier VARCHAR(50) NOT NULL,
  quoted_price DECIMAL(10,2) NOT NULL,
  payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  payment_method ENUM('cash', 'card') NULL,
  payment_date TIMESTAMP NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (application_id) REFERENCES restaurant_applications(id)
);

-- All staff users, linked to a restaurant
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'waiter', 'kitchen', 'delivery') NOT NULL,

  -- Delivery driver info
  car_type VARCHAR(100),
  car_color VARCHAR(50),
  plate_number VARCHAR(20),
  id_number VARCHAR(50),
  driver_license VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Tables per restaurant
CREATE TABLE tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  number INT NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status ENUM('free', 'occupied', 'bill_requested') DEFAULT 'free',
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Categories per restaurant
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Menu items per restaurant
CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Dine-in orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  table_id INT NOT NULL,
  waiter_id INT NOT NULL,
  status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (waiter_id) REFERENCES users(id)
);

-- Order items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'preparing', 'ready') DEFAULT 'pending',
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Delivery orders
CREATE TABLE delivery_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  driver_id INT,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  food_total DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 3.00,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
  delivered_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Delivery order items
CREATE TABLE delivery_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (delivery_order_id) REFERENCES delivery_orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);