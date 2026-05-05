import FastifyCors from '@fastify/cors';
import fp from 'fastify-plugin';

export default fp(async (app) => {
  app.register(FastifyCors, {
    origin: (origin, cb) => {
      const allowedOrigins = app.config.ALLOWED_ORIGINS?.split(',') || [];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
});
