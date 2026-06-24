-- Project Management System Database Script
CREATE DATABASE IF NOT EXISTS project_management;
USE project_management;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'member') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to INT,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('todo', 'in_progress', 'review', 'completed') DEFAULT 'todo',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Project Members Table (Team Management)
CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('manager', 'developer', 'designer', 'tester', 'viewer') DEFAULT 'developer',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (project_id, user_id)
);

-- Sample Admin User (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@pms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
