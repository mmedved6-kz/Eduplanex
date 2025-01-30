-- ADMIN USERS
INSERT INTO Admin (id, username) VALUES
('admin1', 'admin1'),
('admin2', 'admin2');

-- DEPARTMENTS
INSERT INTO Department (name) VALUES
('Computer Science'),
('Mathematics'),
('Physics'),
('Biology');

-- COURSES (Belong to a Department)
INSERT INTO Course (name, departmentId) VALUES
('BSc Computer Science', 1),
('BSc Mathematics', 2),
('BSc Physics', 3),
('BSc Biology', 4);

-- MODULES (Belong to a Course)
INSERT INTO Module (name, courseId) VALUES
('Database Systems', 1),
('Algorithms', 1),
('Linear Algebra', 2),
('Quantum Mechanics', 3);

-- BUILDINGS
INSERT INTO Building (name) VALUES
('Engineering Building'),
('Science Complex'),
('Library'),
('Lecture Hall A');

-- ROOMS (Inside Buildings)
INSERT INTO Room (name, capacity, buildingId) VALUES
('Room 101', 50, 1),
('Room 202', 30, 2),
('Room 303', 100, 3),
('Auditorium', 200, 4);

-- TIME BLOCKS (Predefined Scheduling Slots)
INSERT INTO TimeBlock (startTime, endTime, description) VALUES
('09:00', '11:00', 'Morning Session'),
('11:00', '13:00', 'Mid-Morning Session'),
('14:00', '16:00', 'Afternoon Session'),
('16:00', '18:00', 'Evening Session');

-- STAFF MEMBERS (Belong to a Department, Teach Modules)
INSERT INTO Staff (id, username, name, surname, email, phone, address, img, sex, birthday, createdAt, updatedAt, departmentId) VALUES
(gen_random_uuid(), 'ajohnson', 'Alice', 'Johnson', 'alice.johnson@university.edu', '1234567890', '123 Elm St', NULL, 'FEMALE', '1980-05-14', NOW(), NOW(), 1),
(gen_random_uuid(), 'bsmith', 'Bob', 'Smith', 'bob.smith@university.edu', '0987654321', '456 Oak Ave', NULL, 'MALE', '1975-08-22', NOW(), NOW(), 2);

-- CLASSES (Linked to a Module, Staff, and Room)
INSERT INTO Class (name, day, timeBlockId, moduleId, startTime, endTime, capacity, staffId, roomId) VALUES
('CS101 - Database Systems', 'MONDAY', 1, 1, '09:00', '11:00', 50, (SELECT id FROM Staff WHERE username = 'ajohnson'), 1),
('MATH201 - Linear Algebra', 'TUESDAY', 2, 3, '11:00', '13:00', 30, (SELECT id FROM Staff WHERE username = 'bsmith'), 2);

-- STUDENTS (Assigned to a Course, Module, Class, and Room)
INSERT INTO Student (id, username, name, surname, email, phone, address, img, sex, birthday, createdAt, updatedAt, classId, courseId, moduleId, roomId) VALUES
(gen_random_uuid(), 'jsmith', 'John', 'Smith', 'john.smith@student.university.edu', '5551234567', '789 Pine Rd', NULL, 'MALE', '2003-07-19', NOW(), NOW(), 1, 1, 1, 1),
(gen_random_uuid(), 'lroberts', 'Lisa', 'Roberts', 'lisa.roberts@student.university.edu', '5559876543', '321 Maple Dr', NULL, 'FEMALE', '2004-02-25', NOW(), NOW(), 2, 2, 3, 2);

-- EVENTS (Exams, Social Events, etc.)
INSERT INTO Event (title, description, startTime, endTime, classId, roomId) VALUES
('Database Systems Midterm Exam', 'Midterm exam for CS101', '2025-03-15 10:00:00', '2025-03-15 12:00:00', 1, 1),
('Linear Algebra Workshop', 'Guest lecture on Linear Algebra', '2025-04-10 14:00:00', '2025-04-10 16:00:00', 2, 2);

-- ASSIGNMENTS (Linked to an Event & Class)
INSERT INTO Assignment (title, startDate, dueDate, eventId, classId) VALUES
('Database Systems Homework 1', '2025-02-01', '2025-02-10', 1, 1),
('Linear Algebra Problem Set', '2025-02-05', '2025-02-15', 2, 2);

-- ATTENDANCE (Tracking Student Presence in Events)
INSERT INTO Attendance (date, present, studentId, eventId) VALUES
('2025-03-15', TRUE, (SELECT id FROM Student WHERE username = 'jsmith'), 1),
('2025-04-10', FALSE, (SELECT id FROM Student WHERE username = 'lroberts'), 2);

-- RESULTS (Tracking Student Scores for Events)
INSERT INTO Result (score, eventId, studentId) VALUES
(85, 1, (SELECT id FROM Student WHERE username = 'jsmith')),
(92, 2, (SELECT id FROM Student WHERE username = 'lroberts'));

-- ANNOUNCEMENTS (Linked to a Department)
INSERT INTO Announcement (title, description, date, departmentId) VALUES
('Exam Schedules Released', 'Midterm and Final exam schedules are now available.', '2025-02-01', 1),
('New Research Opportunity', 'Applications open for undergraduate research programs.', '2025-03-01', 2);