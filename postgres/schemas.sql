-- ENUMS
CREATE TYPE UserSex AS ENUM ('MALE', 'FEMALE');
CREATE TYPE Day AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');
CREATE TYPE EventTag AS ENUM ('CLASS', 'EXAM', 'MEETING', 'EVENT');

-- DEPARTMENT TABLE
CREATE TABLE Department (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'DEPT01'
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- COURSE TABLE
CREATE TABLE Course (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'CS101'
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    credit_hours INT NOT NULL DEFAULT 3,
    departmentId VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);

-- MODULE TABLE
CREATE TABLE Module (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'MOD101'
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    courseId VARCHAR(20) NOT NULL,
    semester VARCHAR(20),  -- e.g. 'Fall 2023'
    FOREIGN KEY (courseId) REFERENCES Course(id)
);

-- BUILDING TABLE
CREATE TABLE Building (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'BLD01'
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ROOM TABLE
CREATE TABLE Room (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'RM101'
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) NOT NULL,  -- e.g. 'LECTURE', 'LAB', 'SEMINAR'
    capacity INT NOT NULL,
    buildingId VARCHAR(20) NOT NULL,
    equipment TEXT[],  -- Array of equipment available
    FOREIGN KEY (buildingId) REFERENCES Building(id)
);

-- STAFF TABLE
CREATE TABLE Staff (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'STAFF001'
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    sex UserSex NOT NULL,
    departmentId VARCHAR(20) NOT NULL,
    position VARCHAR(100),  -- e.g. 'Professor', 'Lecturer'
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (departmentId) REFERENCES Department(id) 
);

-- STUDENT TABLE
CREATE TABLE Student (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'STU001'
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    sex UserSex NOT NULL,
    enrollment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- EVENT TABLE
CREATE TABLE Event (
    id VARCHAR(20) PRIMARY KEY,  -- e.g. 'EVT001'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    tag EventTag NOT NULL,
    moduleId VARCHAR(20),
    staffId VARCHAR(20),
    roomId VARCHAR(20),
    student_count INT,
    recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (moduleId) REFERENCES Module(id),
    FOREIGN KEY (staffId) REFERENCES Staff(id),
    FOREIGN KEY (roomId) REFERENCES Room(id)
);

-- STUDENT-EVENT REGISTRATION
CREATE TABLE event_students (
    eventId VARCHAR(20) NOT NULL,
    studentId VARCHAR(20) NOT NULL,
    registration_date TIMESTAMP DEFAULT NOW(),
    attendance_status VARCHAR(20) DEFAULT 'REGISTERED',
    PRIMARY KEY (eventId, studentId),
    FOREIGN KEY (eventId) REFERENCES Event(id),
    FOREIGN KEY (studentId) REFERENCES Student(id)
);