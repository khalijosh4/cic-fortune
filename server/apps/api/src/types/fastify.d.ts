import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; role: string; hospitalId?: string; branchId?: string; email?: string; branchName?: string };
    user: { id: string; role: string; hospitalId?: string; branchId?: string; email?: string; branchName?: string };
  }
}
