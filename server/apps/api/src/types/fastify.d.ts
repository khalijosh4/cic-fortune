import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; role: string; hospitalId?: string; branchId?: string };
    user: { id: string; role: string; hospitalId?: string; branchId?: string };
  }
}
