// TEMPORARY DATA

export let role = "admin";

export const staffData = [
  {
    id: 1,
    staffId: "S1234567",
    name: "John Doe",
    email: "john.doe@university.com",
    photo:
      "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    department: "Mathematics",
    modules: ["Algebra", "Calculus"],
    address: "123 University Rd, Anytown, UK",
  },
  {
    id: 2,
    staffId: "S2345678",
    name: "Jane Doe",
    email: "jane.doe@university.com",
    photo:
      "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "0987654321",
    department: "Physics",
    modules: ["Quantum Mechanics", "Thermodynamics"],
    address: "456 Campus Ave, Anytown, UK",
  },
  {
    id: 3,
    staffId: "S3456789",
    name: "Mike Geller",
    email: "mike.geller@university.com",
    photo:
      "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1122334455",
    department: "Biology",
    modules: ["Genetics", "Cell Biology"],
    address: "789 Faculty Ln, Anytown, UK",
  },
  {
    id: 4,
    staffId: "S4567890",
    name: "Anna Santiago",
    email: "anna.santiago@university.com",
    photo:
      "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "5566778899",
    department: "Engineering",
    modules: ["Fluid Mechanics", "Thermodynamics"],
    address: "101 Tech Rd, Anytown, UK",
  }
];

export const studentsData = [
  {
    id: 1,
    studentId: "U1234567",
    name: "John Doe",
    email: "john.doe@university.com",
    photo: "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1234567890",
    year: 3,
    course: "Computer Science",
    modules: ["Data Structures", "Algorithms"],
    address: "123 University St, Anytown, UK",
  },
  {
    id: 2,
    studentId: "U2345678",
    name: "Jane Doe",
    email: "jane.doe@university.com",
    photo: "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "0987654321",
    year: 2,
    course: "Mathematics",
    modules: ["Calculus", "Linear Algebra"],
    address: "456 College Rd, Anytown, UK",
  },
  {
    id: 3,
    studentId: "U3456789",
    name: "Mike Geller",
    email: "mike.geller@university.com",
    photo: "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "1122334455",
    year: 1,
    course: "Physics",
    modules: ["Quantum Mechanics", "Classical Mechanics"],
    address: "789 Campus Ln, Anytown, UK",
  },
  {
    id: 4,
    studentId: "U4567890",
    name: "Anna Santiago",
    email: "anna.santiago@university.com",
    photo: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=1200",
    phone: "5566778899",
    year: 4,
    course: "Engineering",
    modules: ["Thermodynamics", "Fluid Mechanics"],
    address: "101 Tech Rd, Anytown, UK",
  }
];


export const subjectsData = [
  {
    id: 1,
    name: "Math",
    staff: ["Alice Phelps", "Russell Davidson"],
  },
  {
    id: 2,
    name: "English",
    staff: ["Manuel Becker", "Eddie Chavez"],
  },
  {
    id: 3,
    name: "Physics",
    staff: ["Lola Newman", "Darrell Delgado"],
  },
  {
    id: 4,
    name: "Chemistry",
    staff: ["Nathan Kelly", "Benjamin Snyder"],
  },
  {
    id: 5,
    name: "Biology",
    staff: ["Alma Benson", "Lina Collier"],
  },
  {
    id: 6,
    name: "History",
    staff: ["Hannah Bowman", "Betty Obrien"],
  },
  {
    id: 7,
    name: "Geography",
    staff: ["Lora French", "Sue Brady"],
  },
  {
    id: 8,
    name: "Art",
    staff: ["Harriet Alvarado", "Mayme Keller"],
  },
  {
    id: 9,
    name: "Music",
    staff: ["Gertrude Roy", "Rosa Singleton"],
  },
  {
    id: 10,
    name: "Literature",
    staff: ["Effie Lynch", "Brett Flowers"],
  },
];

export const classesData = [
  {
    id: 1,
    name: "1A",
    capacity: 20,
    grade: 1,
    supervisor: "Joseph Padilla",
  },
  {
    id: 2,
    name: "2B",
    capacity: 22,
    grade: 2,
    supervisor: "Blake Joseph",
  },
  {
    id: 3,
    name: "3C",
    capacity: 20,
    grade: 3,
    supervisor: "Tom Bennett",
  },
  {
    id: 4,
    name: "4B",
    capacity: 18,
    grade: 4,
    supervisor: "Aaron Collins",
  },
  {
    id: 5,
    name: "5A",
    capacity: 16,
    grade: 5,
    supervisor: "Iva Frank",
  },
  {
    id: 5,
    name: "5B",
    capacity: 20,
    grade: 5,
    supervisor: "Leila Santos",
  },
  {
    id: 7,
    name: "7A",
    capacity: 18,
    grade: 7,
    supervisor: "Carrie Walton",
  },
  {
    id: 8,
    name: "6B",
    capacity: 22,
    grade: 6,
    supervisor: "Christopher Butler",
  },
  {
    id: 9,
    name: "6C",
    capacity: 18,
    grade: 6,
    supervisor: "Marc Miller",
  },
  {
    id: 10,
    name: "6D",
    capacity: 20,
    grade: 6,
    supervisor: "Ophelia Marsh",
  },
];

export const lessonsData = [
  {
    id: 1,
    subject: "Math",
    class: "1A",
    staff: "Tommy Wise",
  },
  {
    id: 2,
    subject: "English",
    class: "2A",
    staff: "Rhoda Frank",
  },
  {
    id: 3,
    subject: "Science",
    class: "3A",
    staff: "Della Dunn",
  },
  {
    id: 4,
    subject: "Social Studies",
    class: "1B",
    staff: "Bruce Rodriguez",
  },
  {
    id: 5,
    subject: "Art",
    class: "4A",
    staff: "Birdie Butler",
  },
  {
    id: 6,
    subject: "Music",
    class: "5A",
    staff: "Bettie Oliver",
  },
  {
    id: 7,
    subject: "History",
    class: "6A",
    staff: "Herman Howard",
  },
  {
    id: 8,
    subject: "Geography",
    class: "6B",
    staff: "Lucinda Thomas",
  },
  {
    id: 9,
    subject: "Physics",
    class: "6C",
    staff: "Ronald Roberts",
  },
  {
    id: 10,
    subject: "Chemistry",
    class: "4B",
    staff: "Julia Pittman",
  },
];

export const examsData = [
  {
    id: 1,
    subject: "Math",
    class: "1A",
    staff: "Martha Morris",
    date: "2025-01-01",
  },
  {
    id: 2,
    subject: "English",
    class: "2A",
    staff: "Randall Garcia",
    date: "2025-01-01",
  },
  {
    id: 3,
    subject: "Science",
    class: "3A",
    staff: "Myrtie Scott",
    date: "2025-01-01",
  },
  {
    id: 4,
    subject: "Social Studies",
    class: "1B",
    staff: "Alvin Swanson",
    date: "2025-01-01",
  },
  {
    id: 5,
    subject: "Art",
    class: "4A",
    staff: "Mabelle Wallace",
    date: "2025-01-01",
  },
  {
    id: 6,
    subject: "Music",
    class: "5A",
    staff: "Dale Thompson",
    date: "2025-01-01",
  },
  {
    id: 7,
    subject: "History",
    class: "6A",
    staff: "Allie Conner",
    date: "2025-01-01",
  },
  {
    id: 8,
    subject: "Geography",
    class: "6B",
    staff: "Hunter Fuller",
    date: "2025-01-01",
  },
  {
    id: 9,
    subject: "Physics",
    class: "7A",
    staff: "Lois Lindsey",
    date: "2025-01-01",
  },
  {
    id: 10,
    subject: "Chemistry",
    class: "8A",
    staff: "Vera Soto",
    date: "2025-01-01",
  },
];

export const assignmentsData = [
  {
    id: 1,
    subject: "Math",
    class: "1A",
    staff: "Anthony Boone",
    dueDate: "2025-01-01",
  },
  {
    id: 2,
    subject: "English",
    class: "2A",
    staff: "Clifford Bowen",
    dueDate: "2025-01-01",
  },
  {
    id: 3,
    subject: "Science",
    class: "3A",
    staff: "Catherine Malone",
    dueDate: "2025-01-01",
  },
  {
    id: 4,
    subject: "Social Studies",
    class: "1B",
    staff: "Willie Medina",
    dueDate: "2025-01-01",
  },
  {
    id: 5,
    subject: "Art",
    class: "4A",
    staff: "Jose Ruiz",
    dueDate: "2025-01-01",
  },
  {
    id: 6,
    subject: "Music",
    class: "5A",
    staff: "Katharine Owens",
    dueDate: "2025-01-01",
  },
  {
    id: 7,
    subject: "History",
    class: "6A",
    staff: "Shawn Norman",
    dueDate: "2025-01-01",
  },
  {
    id: 8,
    subject: "Geography",
    class: "6B",
    staff: "Don Holloway",
    dueDate: "2025-01-01",
  },
  {
    id: 9,
    subject: "Physics",
    class: "7A",
    staff: "Franklin Gregory",
    dueDate: "2025-01-01",
  },
  {
    id: 10,
    subject: "Chemistry",
    class: "8A",
    staff: "Danny Nguyen",
    dueDate: "2025-01-01",
  },
];

export const resultsData = [
  {
    id: 1,
    subject: "Math",
    class: "1A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 2,
    subject: "English",
    class: "2A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 3,
    subject: "Science",
    class: "3A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 4,
    subject: "Social Studies",
    class: "1B",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 5,
    subject: "Art",
    class: "4A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 6,
    subject: "Music",
    class: "5A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 7,
    subject: "History",
    class: "6A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 8,
    subject: "Geography",
    class: "6B",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 9,
    subject: "Physics",
    class: "7A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
  {
    id: 10,
    subject: "Chemistry",
    class: "8A",
    staff: "John Doe",
    student: "John Doe",
    date: "2025-01-01",
    type: "exam",
    score: 90,
  },
];

export const eventsData = [
  {
    id: 1,
    title: "Lake Trip",
    class: "1A",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 2,
    title: "Picnic",
    class: "2A",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 3,
    title: "Beach Trip",
    class: "3A",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 4,
    title: "Museum Trip",
    class: "4A",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 5,
    title: "Music Concert",
    class: "5A",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 6,
    title: "Magician Show",
    class: "1B",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 7,
    title: "Lake Trip",
    class: "2B",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 8,
    title: "Cycling Race",
    class: "3B",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 9,
    title: "Art Exhibition",
    class: "4B",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: 10,
    title: "Sports Tournament",
    class: "5B",
    date: "2025-01-01",
    startTime: "10:00",
    endTime: "11:00",
  },
];

export const classData = [
  {
    id: 1,
    classId: "C001",
    name: "Introduction to Computer Science",
    course: "BSc Computer Science",
    modules: ["Programming Basics", "Data Structures"],
    staff: ["Dr. Jane Smith", "Prof. John Doe"],
    capacity: 30,
    room: "A101",
  },
  {
    id: 2,
    classId: "C002",
    name: "Advanced Mathematics",
    course: "BSc Mathematics",
    modules: ["Linear Algebra", "Calculus II"],
    staff: ["Dr. Alan Turing"],
    capacity: 25,
    room: "B201",
  },
  {
    id: 3,
    classId: "C003",
    name: "Physics Fundamentals",
    course: "BSc Physics",
    modules: ["Classical Mechanics", "Quantum Mechanics"],
    staff: ["Dr. Richard Feynman"],
    capacity: 20,
    room: "C301",
  },
  {
    id: 4,
    classId: "C004",
    name: "Engineering Principles",
    course: "BEng Mechanical Engineering",
    modules: ["Thermodynamics", "Fluid Mechanics"],
    staff: ["Prof. Nikola Tesla"],
    capacity: 35,
    room: "D401",
  },
  {
    id: 5,
    classId: "C005",
    name: "Biology Basics",
    course: "BSc Biology",
    modules: ["Cell Biology", "Genetics"],
    staff: ["Dr. Rosalind Franklin"],
    capacity: 40,
    room: "E501",
  }
];

export const announcementsData = [
  {
    id: 1,
    title: "About 4A Math Test",
    class: "4A",
    date: "2025-01-01",
  },
  {
    id: 2,
    title: "About 3A Math Test",
    class: "3A",
    date: "2025-01-01",
  },
  {
    id: 3,
    title: "About 3B Math Test",
    class: "3B",
    date: "2025-01-01",
  },
  {
    id: 4,
    title: "About 6A Math Test",
    class: "6A",
    date: "2025-01-01",
  },
  {
    id: 5,
    title: "About 8C Math Test",
    class: "8C",
    date: "2025-01-01",
  },
  {
    id: 6,
    title: "About 2A Math Test",
    class: "2A",
    date: "2025-01-01",
  },
  {
    id: 7,
    title: "About 4C Math Test",
    class: "4C",
    date: "2025-01-01",
  },
  {
    id: 8,
    title: "About 4B Math Test",
    class: "4B",
    date: "2025-01-01",
  },
  {
    id: 9,
    title: "About 3C Math Test",
    class: "3C",
    date: "2025-01-01",
  },
  {
    id: 10,
    title: "About 1C Math Test",
    class: "1C",
    date: "2025-01-01",
  },
];

export const moduleData = [
  {
    id: 1,
    moduleId: "MATH101",
    name: "Calculus I",
    course: "BSc Mathematics",
    creditValue: 5,
    staffAssigned: ["John Doe", "Jane Smith"]
  },
  {
    id: 2,
    moduleId: "PHYS201",
    name: "Classical Mechanics",
    course: "BSc Physics",
    creditValue: 4,
    staffAssigned: ["Albert Newton"]
  },
  {
    id: 3,
    moduleId: "CS301",
    name: "Algorithms and Data Structures",
    course: "BSc Computer Science",
    creditValue: 6,
    staffAssigned: ["Grace Hopper"]
  },
  {
    id: 4,
    moduleId: "BIO102",
    name: "Cell Biology",
    course: "BSc Biology",
    creditValue: 4,
    staffAssigned: ["Charles Darwin"]
  },
  {
    id: 5,
    moduleId: "CHEM202",
    name: "Organic Chemistry",
    course: "BSc Chemistry",
    creditValue: 5,
    staffAssigned: ["Marie Curie"]
  }
];

export const courseData = [
  {
    id: 1,
    courseId: "BSCMATH",
    name: "BSc Mathematics",
    duration: "3 Years",
    totalCredits: 120,
    modules: ["MATH101", "MATH201", "MATH301"]
  },
  {
    id: 2,
    courseId: "BSCPhys",
    name: "BSc Physics",
    duration: "3 Years",
    totalCredits: 120,
    modules: ["PHYS101", "PHYS201", "PHYS301"]
  },
  {
    id: 3,
    courseId: "BSCCompSci",
    name: "BSc Computer Science",
    duration: "3 Years",
    totalCredits: 120,
    modules: ["CS101", "CS201", "CS301"]
  },
  {
    id: 4,
    courseId: "BSCBio",
    name: "BSc Biology",
    duration: "3 Years",
    totalCredits: 120,
    modules: ["BIO101", "BIO201", "BIO301"]
  },
  {
    id: 5,
    courseId: "BSCChem",
    name: "BSc Chemistry",
    duration: "3 Years",
    totalCredits: 120,
    modules: ["CHEM101", "CHEM201", "CHEM301"]
  }
];


// YOU SHOULD CHANGE THE DATES OF THE EVENTS TO THE CURRENT DATE TO SEE THE EVENTS ON THE CALENDAR
export const calendarEvents = [
  {
    title: "Math",
    allDay: false,
    start: new Date(2025, 0, 7, 8, 0),
    end: new Date(2025, 0, 7, 8, 45),
  },
  {
    title: "English",
    allDay: false,
    start: new Date(2025, 0, 7, 9, 0),
    end: new Date(2025, 0, 7, 9, 45),
  },
  {
    title: "Biology",
    allDay: false,
    start: new Date(2025, 0, 7, 10, 0),
    end: new Date(2025, 0, 7, 10, 45),
  },
  {
    title: "Physics",
    allDay: false,
    start: new Date(2025, 0, 7, 11, 0),
    end: new Date(2025, 0, 7, 11, 45),
  },
  {
    title: "Chemistry",
    allDay: false,
    start: new Date(2025, 0, 7, 13, 0),
    end: new Date(2025, 0, 7, 13, 45),
  },
  {
    title: "History",
    allDay: false,
    start: new Date(2025, 0, 7, 14, 0),
    end: new Date(2025, 0, 7, 14, 45),
  },
  {
    title: "English",
    allDay: false,
    start: new Date(2025, 0, 8, 9, 0),
    end: new Date(2025, 0, 8, 9, 45),
  },
  {
    title: "Biology",
    allDay: false,
    start: new Date(2025, 0, 8, 10, 0),
    end: new Date(2025, 0, 8, 10, 45),
  },
  {
    title: "Physics",
    allDay: false,
    start: new Date(2025, 0, 8, 11, 0),
    end: new Date(2025, 0, 8, 11, 45),
  },

  {
    title: "History",
    allDay: false,
    start: new Date(2025, 0, 8, 14, 0),
    end: new Date(2025, 0, 8, 14, 45),
  },
  {
    title: "Math",
    allDay: false,
    start: new Date(2025, 0, 9, 8, 0),
    end: new Date(2025, 0, 9, 8, 45),
  },
  {
    title: "Biology",
    allDay: false,
    start: new Date(2025, 0, 9, 10, 0),
    end: new Date(2025, 0, 9, 10, 45),
  },

  {
    title: "Chemistry",
    allDay: false,
    start: new Date(2025, 0, 9, 13, 0),
    end: new Date(2025, 0, 9, 13, 45),
  },
  {
    title: "History",
    allDay: false,
    start: new Date(2025, 0, 9, 14, 0),
    end: new Date(2025, 0, 9, 14, 45),
  },
  {
    title: "English",
    allDay: false,
    start: new Date(2025, 0, 10, 9, 0),
    end: new Date(2025, 0, 10, 9, 45),
  },
  {
    title: "Biology",
    allDay: false,
    start: new Date(2025, 0, 10, 10, 0),
    end: new Date(2025, 0, 10, 10, 45),
  },
  {
    title: "Physics",
    allDay: false,
    start: new Date(2025, 0, 10, 11, 0),
    end: new Date(2025, 0, 10, 11, 45),
  },

  {
    title: "History",
    allDay: false,
    start: new Date(2025, 0, 10, 14, 0),
    end: new Date(2025, 0, 10, 14, 45),
  },
  {
    title: "Math",
    allDay: false,
    start: new Date(2025, 0, 11, 8, 0),
    end: new Date(2025, 0, 11, 8, 45),
  },
  {
    title: "English",
    allDay: false,
    start: new Date(2025, 0, 11, 9, 0),
    end: new Date(2025, 0, 11, 9, 45),
  },

  {
    title: "Physics",
    allDay: false,
    start: new Date(2025, 0, 11, 11, 0),
    end: new Date(2025, 0, 11, 11, 45),
  },
  {
    title: "Chemistry",
    allDay: false,
    start: new Date(2025, 0, 11, 13, 0),
    end: new Date(2025, 0, 11, 13, 45),
  },
  {
    title: "History",
    allDay: false,
    start: new Date(2025, 0, 11, 14, 0),
    end: new Date(2025, 0, 11, 14, 45),
  },
];