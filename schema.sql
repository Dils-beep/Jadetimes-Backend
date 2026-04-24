-- Database Schema for Jadetimes Journals

CREATE DATABASE IF NOT EXISTS jadetimes_journals;
USE jadetimes_journals;

-- Users Table (Linked to Firebase UID)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(50) PRIMARY KEY, -- e.g., sub_1710240000000
    user_id VARCHAR(255),
    title TEXT NOT NULL,
    section VARCHAR(100),
    abstract TEXT,
    keywords TEXT,
    competing_interests TEXT,
    subjects TEXT,
    comments_for_editor TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    checklist_agreed BOOLEAN DEFAULT FALSE,
    privacy_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Contributors Table
CREATE TABLE IF NOT EXISTS contributors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50),
    affiliation VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Submission Files Table
CREATE TABLE IF NOT EXISTS submission_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(50),
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Funders Table
CREATE TABLE IF NOT EXISTS funders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    funder_id VARCHAR(100),
    grant_number VARCHAR(100),
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);
