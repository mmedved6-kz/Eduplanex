const { z } = require('zod');

const studentSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    emaiL: z.string().email({ message: 'Invalid email address' }),
    courseId: z.number().int({ message: 'Course ID must be an integer' }),
});

module.exports = studentSchema;