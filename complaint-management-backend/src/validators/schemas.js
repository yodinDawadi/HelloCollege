const { z } = require('zod');
const { CATEGORY_RULES } = require('../rules');

const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), rollNumber: z.string().optional(), role: z.enum(['student', 'admin']).optional(), department: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string() });
const complaintSchema = z.object({ category: z.enum(Object.keys(CATEGORY_RULES)), description: z.string().min(10).max(2000), location: z.string().min(2).max(200), attachmentUrl: z.string().url().optional() });
const statusSchema = z.object({ status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']), note: z.string().max(500).optional(), assignedTo: z.string().optional() });

module.exports = { registerSchema, loginSchema, complaintSchema, statusSchema };
