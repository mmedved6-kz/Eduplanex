const { z } = require('zod');

const courseSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    departmentId: z.number().int({ message: 'Department ID must be an integer' }),
});

module.exports = courseSchema;