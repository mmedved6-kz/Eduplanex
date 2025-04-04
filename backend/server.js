const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const courseRoutes = require('./routes/courseRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const constraintRoutes = require('./routes/constraintRoutes');
const schedulerServiceRoutes = require('./routes/schedulerServiceRoutes'); // Add this line
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/scheduler', schedulerServiceRoutes); // Add this line

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});