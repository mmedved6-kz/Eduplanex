-- ENUMS
CREATE TYPE UserSex AS ENUM ('MALE', 'FEMALE');
CREATE TYPE Day AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- ADMIN TABLE
CREATE TABLE Admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL
);

-- DEPARTMENT TABLE
CREATE TABLE Department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- COURSE TABLE (Belongs to a department)
CREATE TABLE Course (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    departmentId INT NOT NULL,
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);

-- MODULE TABLE (Belongs to a course)
CREATE TABLE Module (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    courseId INT NOT NULL,
    FOREIGN KEY (courseId) REFERENCES Course(id)
);

-- BUILDING TABLE (Physical locations)
CREATE TABLE Building (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- ROOM TABLE (Inside buildings)
CREATE TABLE Room (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    buildingId INT NOT NULL,
    FOREIGN KEY (buildingId) REFERENCES Building(id)
);

-- TIMEBLOCK TABLE (Predefined time slots for lessons)
CREATE TABLE TimeBlock (
    id SERIAL PRIMARY KEY,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    description VARCHAR(255)
);

-- TIMESTAMP TABLE (Logging system events)
CREATE TABLE Timestamp (
    id SERIAL PRIMARY KEY,
    eventType VARCHAR(255) NOT NULL,
    eventTime TIMESTAMP DEFAULT NOW()
);

-- STAFF TABLE
CREATE TABLE Staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    address TEXT,
    img TEXT,
    sex UserSex NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
	updatedAt TIMESTAMP DEFAULT NOW(),
    birthday TIMESTAMP NOT NULL,
	departmentId INT NOT NULL,
	FOREIGN KEY (departmentId) REFERENCES Department(id) 
);

-- CLASS TABLE
CREATE TABLE Class (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
	day Day NOT NULL,
	timeblockId INT NOT NULL,
	moduleId INT NOT NULL,
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    capacity INT NOT NULL,
    staffId UUID NOT NULL,
	roomId INT NOT NULL,
	FOREIGN KEY (timeBlockId) REFERENCES TimeBlock(id),
    FOREIGN KEY (staffId) REFERENCES Staff(id)
);

-- STUDENT TABLE
CREATE TABLE Student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    address TEXT,
    img TEXT,
    sex UserSex NOT NULL,
    classId INT NOT NULL,
	courseId INT NOT NULL,
	moduleId INT NOT NULL,
    birthday TIMESTAMP NOT NULL,
	createdAt TIMESTAMP DEFAULT NOW(),
	updatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (classId) REFERENCES Class(id),
	FOREIGN KEY (courseId) REFERENCES Course(id),
	FOREIGN KEY (moduleId) REFERENCES Module(id)
);


-- Event TABLE
CREATE TABLE Event (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    classId INT NOT NULL,
    FOREIGN KEY (classId) REFERENCES Class(id)
);

-- ASSIGNMENT TABLE
CREATE TABLE Assignment (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    startDate TIMESTAMP NOT NULL,
    dueDate TIMESTAMP NOT NULL,
    classId INT NOT NULL,
    FOREIGN KEY (classId) REFERENCES Class(id)
);

-- RESULT TABLE
CREATE TABLE Result (
    id SERIAL PRIMARY KEY,
    score INT NOT NULL,
    eventId INT,
    assignmentId INT,
    studentId UUID NOT NULL,
    FOREIGN KEY (eventId) REFERENCES Event(id),
    FOREIGN KEY (assignmentId) REFERENCES Assignment(id),
    FOREIGN KEY (studentId) REFERENCES Student(id)
);

-- ATTENDANCE TABLE
CREATE TABLE Attendance (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    present BOOLEAN NOT NULL,
    studentId UUID NOT NULL,
    classId INT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES Student(id),
    FOREIGN KEY (classId) REFERENCES Class(id)
);

-- ANNOUNCEMENT TABLE
CREATE TABLE Announcement (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    classId INT,
    FOREIGN KEY (classId) REFERENCES Class(id)
);