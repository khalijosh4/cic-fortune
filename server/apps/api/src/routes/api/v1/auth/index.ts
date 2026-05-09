import { db, schema } from '@fastify-forge/db';
const { user } = schema;
import { or, sql } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import bcrypt from 'bcryptjs';

import { LoginSchema, RegisterSchema } from '#/schemas/auth.schema.js';

const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post('/login', { schema: LoginSchema }, async (request, reply) => {
    const { identifier, password } = request.body;

    const findResult = await db.select().from(user)
      .where(or(
        sql`LOWER(${user.email}) = LOWER(${identifier})`,
        sql`LOWER(${user.id}) = LOWER(${identifier})`
      ))
      .limit(1);
    const foundUser = findResult[0];

    if (!foundUser) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);

    if (!isValid) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({ 
      id: foundUser.id, 
      role: foundUser.role, 
      hospitalId: foundUser.hospitalId ?? undefined, 
      branchId: foundUser.branchId ?? undefined 
    });

    return reply.send({
      token,
      user: {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        role: foundUser.role,
        mustChangePassword: foundUser.mustChangePassword,
        branchId: foundUser.branchId,
        hospitalId: foundUser.hospitalId,
      },
    });
  });

  fastify.post('/register', { schema: RegisterSchema }, async (request, reply) => {
    // Note: In a real app, this should be protected or only accessible to admins
    const { firstName, lastName, phoneNumber, password, role, branchId, hospitalId } = request.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await db.insert(user).values({
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      role: role as any,
      branchId: branchId || null,
      hospitalId: hospitalId || null,
    } as any).returning({ id: user.id }) as any;
    
    const newUser = insertResult[0];

    return reply.code(201).send({
      message: 'User registered successfully',
      userId: newUser.id,
    });
  });
};

export default authRoutes;
