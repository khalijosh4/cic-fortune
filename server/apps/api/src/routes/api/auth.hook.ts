import type { FastifyInstance } from 'fastify';

export default async function authHook(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return;
    }
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.unauthorized('You must be logged in to access this resource.');
    }
  });
}
