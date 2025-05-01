const { z } = require('zod');

const studentSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    courseId: z.string().min({ message: 'Course is required' }),
});

module.exports = studentSchema;