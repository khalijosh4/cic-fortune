import { Type } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  id: Type.String(),
  structuredId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  firstName: Type.String(),
  middleName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  lastName: Type.String(),
  email: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  phoneNumber: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  role: Type.String(),
  branchId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  hospitalId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  createdAt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  updatedAt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  branchName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreateUserSchema = {
  body: Type.Object({
    firstName: Type.String(),
    middleName: Type.Optional(Type.String()),
    lastName: Type.String(),
    email: Type.String(),
    password: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    role: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    hospitalId: Type.Optional(Type.String()),
  }),
  response: {
    201: UserSchema,
  },
};

export const UpdateUserSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    firstName: Type.Optional(Type.String()),
    middleName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    role: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    hospitalId: Type.Optional(Type.String()),
  }),
  response: {
    200: UserSchema,
  },
};

export const ListUserSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    role: Type.Optional(Type.String()),
    'role[]': Type.Optional(Type.Array(Type.String())),
    branchId: Type.Optional(Type.String()),
    'branchId[]': Type.Optional(Type.Array(Type.String())),
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(UserSchema),
      total: Type.Number(),
    }),
  },
};
