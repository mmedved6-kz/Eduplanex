const { z } = require('zod');

const moduleSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    courseId: z.number().int({ message: 'Course ID must be an integer' }),
});

module.exports = moduleSchema;