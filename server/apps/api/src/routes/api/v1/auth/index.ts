import { db, schema } from '@fastify-forge/db';
const { user, userPermission, permission } = schema;
import { or, sql, eq } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import bcrypt from 'bcryptjs';

import { LoginSchema, RegisterSchema, ChangePasswordSchema } from '#/schemas/auth.schema.js';

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

    // Fetch user permissions
    const userPerms = await db.select({ name: permission.name })
      .from(permission)
      .innerJoin(userPermission, eq(userPermission.permissionId, permission.id))
      .where(eq(userPermission.userId, foundUser.id));
    const permissionNames = userPerms.map(p => p.name);

    const token = fastify.jwt.sign({ 
      id: foundUser.id, 
      role: foundUser.role,
      permissions: permissionNames,
      hospitalId: foundUser.hospitalId ?? undefined, 
      branchId: foundUser.branchId ?? undefined 
    } as any);

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
        permissions: permissionNames,
      },
    });
  });

  fastify.post('/change-password', { schema: ChangePasswordSchema }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const userId = (request.user as any).id;

    const [foundUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!foundUser) return reply.unauthorized('User not found');

    const isValid = await bcrypt.compare(currentPassword, foundUser.password);
    if (!isValid) return reply.code(401).send({ message: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(user)
      .set({ password: hashedPassword, mustChangePassword: false })
      .where(eq(user.id, userId));

    return reply.send({ message: 'Password updated successfully' });
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
