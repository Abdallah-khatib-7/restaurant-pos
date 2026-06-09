USE restaurant_pos;

-- Add delivery fields to users
ALTER TABLE users
  ADD COLUMN car_type VARCHAR(100),
  ADD COLUMN car_color VARCHAR(50),
  ADD COLUMN plate_number VARCHAR(20),
  ADD COLUMN id_number VARCHAR(50),
  ADD COLUMN driver_license VARCHAR(50);

-- Delivery orders
CREATE TABLE delivery_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
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