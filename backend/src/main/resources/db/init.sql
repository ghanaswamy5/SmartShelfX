-- SmartShelfX Database Schema
-- Run this once to initialize your PostgreSQL database

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles Table
CREATE TABLE roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE,
                       description TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       role_id BIGINT NOT NULL,
                       phone VARCHAR(20),
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 3. Categories Table
CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE,
                            description TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Suppliers Table
CREATE TABLE suppliers (
                           id BIGSERIAL PRIMARY KEY,
                           name VARCHAR(100) NOT NULL,
                           contact_name VARCHAR(100),
                           email VARCHAR(100),
                           phone VARCHAR(20),
                           address TEXT,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products Table
CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          sku VARCHAR(50) NOT NULL UNIQUE,
                          barcode VARCHAR(50),
                          name VARCHAR(200) NOT NULL,
                          description TEXT,
                          category_id BIGINT,
                          supplier_id BIGINT,
                          cost_price DECIMAL(10, 2) NOT NULL,
                          selling_price DECIMAL(10, 2) NOT NULL,
                          current_stock INTEGER NOT NULL DEFAULT 0,
                          reorder_level INTEGER NOT NULL DEFAULT 10,
                          reorder_quantity INTEGER DEFAULT 50,
                          min_stock INTEGER DEFAULT 5,
                          max_stock INTEGER DEFAULT 500,
                          unit VARCHAR(20) DEFAULT 'pcs',
                          expiry_date DATE,
                          is_active BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                          FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_expiry_date ON products(expiry_date);
CREATE INDEX idx_products_current_stock ON products(current_stock);

-- 6. Sales Table
CREATE TABLE sales (
                       id BIGSERIAL PRIMARY KEY,
                       sale_number VARCHAR(50) NOT NULL UNIQUE,
                       user_id BIGINT NOT NULL,
                       customer_name VARCHAR(100),
                       customer_email VARCHAR(100),
                       customer_phone VARCHAR(20),
                       sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       subtotal DECIMAL(10, 2) NOT NULL,
                       discount_percent DECIMAL(5, 2) DEFAULT 0,
                       discount_amount DECIMAL(10, 2) DEFAULT 0,
                       tax_amount DECIMAL(10, 2) DEFAULT 0,
                       total_amount DECIMAL(10, 2) NOT NULL,
                       payment_method VARCHAR(50) DEFAULT 'CASH',
                       payment_status VARCHAR(20) DEFAULT 'COMPLETED',
                       notes TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sales_sale_number ON sales(sale_number);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_user_id ON sales(user_id);

-- 7. Sale Items Table
CREATE TABLE sale_items (
                            id BIGSERIAL PRIMARY KEY,
                            sale_id BIGINT NOT NULL,
                            product_id BIGINT NOT NULL,
                            quantity INTEGER NOT NULL,
                            unit_price DECIMAL(10, 2) NOT NULL,
                            discount_percent DECIMAL(5, 2) DEFAULT 0,
                            discount_amount DECIMAL(10, 2) DEFAULT 0,
                            total_price DECIMAL(10, 2) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                            FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- 8. Inventory Movements Table
CREATE TABLE inventory_movements (
                                     id BIGSERIAL PRIMARY KEY,
                                     product_id BIGINT NOT NULL,
                                     movement_type VARCHAR(20) NOT NULL, -- 'IN', 'OUT', 'TRANSFER', 'DAMAGE'
                                     quantity INTEGER NOT NULL,
                                     previous_stock INTEGER NOT NULL,
                                     new_stock INTEGER NOT NULL,
                                     reference_id VARCHAR(100), -- Sale ID, Purchase Order ID, etc.
                                     reference_type VARCHAR(50), -- 'SALE', 'PURCHASE', 'ADJUSTMENT', etc.
                                     notes TEXT,
                                     user_id BIGINT NOT NULL,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (product_id) REFERENCES products(id),
                                     FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);

-- 9. Notifications Table
CREATE TABLE notifications (
                               id BIGSERIAL PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               type VARCHAR(50) NOT NULL, -- 'LOW_STOCK', 'EXPIRY', 'SYSTEM', etc.
                               title VARCHAR(200) NOT NULL,
                               message TEXT NOT NULL,
                               is_read BOOLEAN DEFAULT FALSE,
                               link VARCHAR(500),
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               read_at TIMESTAMP,
                               FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- SEED DATA
-- ============================================

-- 1. Roles
INSERT INTO roles (name, description) VALUES
                                          ('ADMIN', 'Full system access'),
                                          ('MANAGER', 'Can manage inventory, sales, and reports'),
                                          ('EMPLOYEE', 'Can process sales and view inventory');

-- 2. Users (password: password123 for all)
INSERT INTO users (username, email, password_hash, full_name, role_id, phone) VALUES
                                                                                  ('admin', 'admin@smartshelfx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Admin User', 1, '+1234567890'),
                                                                                  ('manager', 'manager@smartshelfx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Manager User', 2, '+1234567891'),
                                                                                  ('employee', 'employee@smartshelfx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Employee User', 3, '+1234567892');

-- 3. Categories
INSERT INTO categories (name, description) VALUES
                                               ('Electronics', 'Electronic devices and accessories'),
                                               ('Clothing', 'Apparel and fashion items'),
                                               ('Food & Beverage', 'Edible items and drinks'),
                                               ('Books', 'Books and publications'),
                                               ('Home & Garden', 'Home improvement and gardening supplies'),
                                               ('Toys', 'Children toys and games'),
                                               ('Health & Beauty', 'Health products and cosmetics'),
                                               ('Automotive', 'Auto parts and accessories');

-- 4. Suppliers
INSERT INTO suppliers (name, contact_name, email, phone, address) VALUES
                                                                      ('TechDistro Inc.', 'John Smith', 'john@techdistro.com', '+1234567890', '123 Tech Park, Silicon Valley, CA'),
                                                                      ('FashionHub Ltd.', 'Sarah Johnson', 'sarah@fashionhub.com', '+1234567891', '456 Fashion Ave, New York, NY'),
                                                                      ('FreshFoods Co.', 'Michael Brown', 'michael@freshfoods.com', '+1234567892', '789 Market St, Chicago, IL'),
                                                                      ('BookWorld LLC', 'Emily Davis', 'emily@bookworld.com', '+1234567893', '321 Library St, Boston, MA'),
                                                                      ('HomeGoods Supply', 'David Wilson', 'david@homegoods.com', '+1234567894', '654 Garden Ave, Seattle, WA');

-- 5. Products (15 sample products)
INSERT INTO products (sku, barcode, name, description, category_id, supplier_id, cost_price, selling_price, current_stock, reorder_level, reorder_quantity, min_stock, max_stock, unit, expiry_date) VALUES
-- Electronics
('SKU-001', 'BAR-001', 'Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 1, 1, 45.00, 79.99, 50, 10, 30, 5, 100, 'pcs', NULL),
('SKU-002', 'BAR-002', 'USB-C Charging Cable', 'Fast charging USB-C to USB-C cable', 1, 1, 8.00, 15.99, 150, 20, 50, 10, 200, 'pcs', NULL),
('SKU-003', 'BAR-003', 'Power Bank 20000mAh', 'Portable power bank with fast charging', 1, 1, 25.00, 49.99, 75, 15, 40, 5, 150, 'pcs', NULL),

-- Clothing
('SKU-004', 'BAR-004', 'Cotton T-Shirt - White', '100% cotton classic fit t-shirt', 2, 2, 10.00, 24.99, 200, 30, 100, 10, 500, 'pcs', NULL),
('SKU-005', 'BAR-005', 'Denim Jeans - Blue', 'Classic blue denim jeans', 2, 2, 30.00, 59.99, 80, 15, 50, 5, 200, 'pcs', NULL),
('SKU-006', 'BAR-006', 'Leather Jacket - Black', 'Premium genuine leather jacket', 2, 2, 80.00, 149.99, 30, 5, 20, 2, 100, 'pcs', NULL),

-- Food & Beverage
('SKU-007', 'BAR-007', 'Organic Green Tea', 'High-quality organic green tea leaves', 3, 3, 12.00, 19.99, 100, 20, 50, 10, 300, 'box', '2026-12-31'),
('SKU-008', 'BAR-008', 'Dark Chocolate 70% Cocoa', 'Premium dark chocolate bar', 3, 3, 5.00, 9.99, 250, 30, 80, 20, 500, 'pcs', '2026-08-15'),
('SKU-009', 'BAR-009', 'Honey 500g Jar', 'Pure organic honey', 3, 3, 8.00, 14.99, 60, 10, 30, 5, 150, 'jar', '2027-01-31'),

-- Books
('SKU-010', 'BAR-010', 'The Great Gatsby', 'Classic novel by F. Scott Fitzgerald', 4, 4, 8.00, 16.99, 45, 10, 25, 5, 100, 'pcs', NULL),
('SKU-011', 'BAR-011', 'Python Programming Guide', 'Complete guide to Python programming', 4, 4, 25.00, 44.99, 35, 8, 20, 3, 80, 'pcs', NULL),

-- Home & Garden
('SKU-012', 'BAR-012', 'Garden Shovel', 'Durable garden shovel with wooden handle', 5, 5, 15.00, 29.99, 40, 10, 25, 5, 120, 'pcs', NULL),
('SKU-013', 'BAR-013', 'LED Plant Grow Light', 'Full spectrum LED grow light for indoor plants', 5, 5, 35.00, 59.99, 25, 5, 15, 2, 80, 'pcs', NULL),

-- Toys
('SKU-014', 'BAR-014', 'Wooden Puzzle Set', 'Educational wooden puzzle for children', 6, 4, 12.00, 24.99, 90, 15, 40, 5, 200, 'pcs', NULL),

-- Health & Beauty
('SKU-015', 'BAR-015', 'Vitamin C Serum', 'Advanced vitamin C serum for skin', 7, 4, 18.00, 34.99, 55, 10, 30, 5, 150, 'bottle', '2026-10-15');

-- Some additional sample data for low stock products
INSERT INTO products (sku, barcode, name, description, category_id, supplier_id, cost_price, selling_price, current_stock, reorder_level, reorder_quantity, min_stock, max_stock, unit, expiry_date) VALUES
                                                                                                                                                                                                         ('SKU-016', 'BAR-016', 'Wireless Mouse', 'Ergonomic wireless mouse', 1, 1, 20.00, 34.99, 3, 10, 25, 5, 100, 'pcs', NULL),
                                                                                                                                                                                                         ('SKU-017', 'BAR-017', 'Expired Milk', 'Fresh milk - EXPIRING SOON', 3, 3, 2.00, 4.99, 5, 10, 20, 3, 50, 'carton', '2026-08-05');

-- ============================================
-- Triggers for updating timestamps
-- ============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();