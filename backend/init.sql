
DROP DATABASE IF EXISTS city_problems_reporting;

CREATE DATABASE IF NOT EXISTS city_problems_reporting;
USE city_problems_reporting;

CREATE TABLE IF NOT EXISTS supervisors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS residents (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password      VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    email         VARCHAR(100),
    address       TEXT,
    is_approved   TINYINT(1) DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    full_name         VARCHAR(100) NOT NULL,
    username          VARCHAR(50) UNIQUE NOT NULL,
    password          VARCHAR(255) NOT NULL,
    phone             VARCHAR(20),
    email             VARCHAR(100),
    address           TEXT,
    performance_score INT DEFAULT 0,
    is_approved       TINYINT(1) DEFAULT 0,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    resident_id           INT NOT NULL,
    assigned_worker_id    INT DEFAULT NULL,
    type                  VARCHAR(100) NOT NULL,
    description           TEXT NOT NULL,
    status                ENUM('Pending', 'Assigned', 'Completed') DEFAULT 'Pending',
    attachment            VARCHAR(255) DEFAULT NULL,
    rating                INT DEFAULT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback              TEXT DEFAULT NULL,
    feedback_attachment   VARCHAR(255) DEFAULT NULL,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id)        REFERENCES residents(id)        ON DELETE CASCADE,
    FOREIGN KEY (assigned_worker_id) REFERENCES workers(id)          ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS complaints (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    worker_id   INT NOT NULL,
    description TEXT NOT NULL,
    attachment  VARCHAR(255) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

INSERT IGNORE INTO supervisors (full_name, username, password)
VALUES ('System Administrator', 'admin', 'admin123');

INSERT IGNORE INTO residents (full_name, username, password, phone, email, address, is_approved)
VALUES ('Resident', 'resident', 'resident123', '9999999999', 'resident@example.com', 'Main Street, City Center', 1);

INSERT IGNORE INTO workers (full_name, username, password, phone, email, address, performance_score, is_approved)
VALUES ( 'Worker', 'worker', 'worker123', '8888888888', 'worker@example.com', 'Service Lane, City Center', 5, 1);
