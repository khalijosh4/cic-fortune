import FastifyCors, { type FastifyCorsOptions } from '@fastify/cors';

export const autoConfig: FastifyCorsOptions = {
  origin: (origin, cb) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');
    if (allowedOrigins?.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  }
};

export default FastifyCors;
