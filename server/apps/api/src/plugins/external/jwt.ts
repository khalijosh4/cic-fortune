import fastifyJwt, { type FastifyJWTOptions } from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';

export const autoConfig = (fastify: FastifyInstance): FastifyJWTOptions => ({
  secret: fastify.config.JWT_SECRET,
});

export default fastifyJwt;
