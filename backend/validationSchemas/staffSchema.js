const { z } = require('zod');

const staffSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    departmentId: z.number().int({ message: 'Department ID must be an integer' }),
});

module.exports = staffSchema;