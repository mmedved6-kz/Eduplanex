const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const courseRoutes = require('./routes/courseRoutes');
//const authRoutes = require('./routes/authRoutes'); // Add this line
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors'); // Add this line
const app = express();


app.use(express.json());

app.use(cors()); // Add this line
app.use(express.json());

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/courses', courseRoutes);
//app.use('/api/auth', authRoutes); // Add this line

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});