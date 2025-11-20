-- =====================================================
-- Bistro Basket Database Setup
-- =====================================================
-- This script creates all tables and relationships
-- exactly as defined in the EER diagram.
-- It assumes the database does not exist yet.
-- =====================================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bistro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE bistro;

-- =====================================================
-- Table: Cus_Details
-- =====================================================
CREATE TABLE IF NOT EXISTS Cus_Details (
    Cus_Id INT AUTO_INCREMENT PRIMARY KEY,
    Cus_Name VARCHAR(45),
    Cus_Email VARCHAR(100),
    Cus_Phone VARCHAR(30),
    Cus_Password VARCHAR(255) NULL,
    UNIQUE KEY uniq_phone (Cus_Phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: Billing
-- =====================================================
CREATE TABLE IF NOT EXISTS Billing (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Date DATETIME,
    Amount DECIMAL(10,2),
    Payment_Info VARCHAR(100),
    Cus_Details_Cus_Id INT,
    CONSTRAINT fk_billing_cus
      FOREIGN KEY (Cus_Details_Cus_Id)
      REFERENCES Cus_Details(Cus_Id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: Menu
-- =====================================================
CREATE TABLE IF NOT EXISTS Menu (
    Item INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(45) NOT NULL,
    Price DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: Food_Details
-- =====================================================
CREATE TABLE IF NOT EXISTS Food_Details (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    Description TEXT,
    Ingredients TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: Cus_Details_has_Menu (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS Cus_Details_has_Menu (
    Cus_Details_Cus_Id INT NOT NULL,
    Menu_Item INT NOT NULL,
    PRIMARY KEY (Cus_Details_Cus_Id, Menu_Item),
    CONSTRAINT fk_cusmenu_cus
      FOREIGN KEY (Cus_Details_Cus_Id)
      REFERENCES Cus_Details(Cus_Id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_cusmenu_menu
      FOREIGN KEY (Menu_Item)
      REFERENCES Menu(Item)
      ON DELETE CASCADE
      ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: Food_Details_has_Menu (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS Food_Details_has_Menu (
    Food_Details_Id INT NOT NULL,
    Menu_Item INT NOT NULL,
    PRIMARY KEY (Food_Details_Id, Menu_Item),
    CONSTRAINT fk_foodmenu_food
      FOREIGN KEY (Food_Details_Id)
      REFERENCES Food_Details(Id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_foodmenu_menu
      FOREIGN KEY (Menu_Item)
      REFERENCES Menu(Item)
      ON DELETE CASCADE
      ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Optional: Feedback table (for feedback form)
-- =====================================================
CREATE TABLE IF NOT EXISTS Feedback (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(100),
    Message TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Insert Sample Data
-- =====================================================
INSERT INTO Cus_Details (Cus_Name, Cus_Email, Cus_Phone)
VALUES
('Alice', 'alice@example.com', '1234567890'),
('Bob', 'bob@example.com', '9876543210')
ON DUPLICATE KEY UPDATE Cus_Name = VALUES(Cus_Name);

INSERT INTO Menu (Name, Price)
VALUES
('Burger', 5.99),
('Pizza', 8.49),
('Pasta', 7.25)
ON DUPLICATE KEY UPDATE Price = VALUES(Price);

INSERT INTO Food_Details (Name, Description, Ingredients)
VALUES
('Cheese Burger', 'Juicy burger with cheese', 'Beef, Cheese, Bun, Lettuce'),
('Margherita Pizza', 'Classic Italian pizza', 'Dough, Tomato, Cheese, Basil'),
('Spaghetti Carbonara', 'Creamy pasta with bacon and parmesan', 'Spaghetti, Egg, Bacon, Parmesan')
ON DUPLICATE KEY UPDATE Description = VALUES(Description);

INSERT INTO Food_Details_has_Menu (Food_Details_Id, Menu_Item)
VALUES
(1,1),
(2,2),
(3,3)
ON DUPLICATE KEY UPDATE Food_Details_Id = VALUES(Food_Details_Id);

-- Optional sample Billing data
INSERT INTO Billing (Date, Amount, Payment_Info, Cus_Details_Cus_Id)
VALUES (NOW(), 19.47, 'Paid', 1)
ON DUPLICATE KEY UPDATE Amount = VALUES(Amount);

-- =====================================================
-- Verify setup
-- =====================================================
SELECT '✅ Bistro database setup complete' AS Status;

SHOW TABLES;
