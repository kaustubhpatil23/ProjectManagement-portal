CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Maker', 'Checker', 'Admin') NOT NULL
);

-- Projects Table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- User-Project Mapping (Many-to-Many)
CREATE TABLE user_projects (
    user_id INT,
    project_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, project_id)
);

-- Issues Table
CREATE TABLE issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INT,
    maker_id INT,
    checker_id INT,
    description TEXT,
    criticality ENUM('High', 'Medium', 'Low') NOT NULL,
    status ENUM('Open', 'Resolved', 'Closed by Testing', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (maker_id) REFERENCES users(id),
    FOREIGN KEY (checker_id) REFERENCES users(id)
);



-- Attachments Table
CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);


ALTER TABLE issues MODIFY COLUMN status ENUM('Open', 'In Progress', 'Resolved', 'Closed by Testing', 'Closed') DEFAULT 'Open';

ALTER TABLE issues ADD COLUMN checker_comment TEXT;
