import FastifyCors, { type FastifyCorsOptions } from '@fastify/cors';

export const autoConfig: FastifyCorsOptions = {
  origin: (origin, cb) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};

export default FastifyCors;
