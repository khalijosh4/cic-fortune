import { Type } from '@sinclair/typebox';

export const LoginSchema = {
  body: Type.Object({
    identifier: Type.String(),
    password: Type.String(),
  }),
  response: {
    200: Type.Object({
      token: Type.String(),
      user: Type.Object({
        id: Type.String(),
        firstName: Type.String(),
        lastName: Type.String(),
        email: Type.String(),
        role: Type.String(),
        mustChangePassword: Type.Boolean(),
        branchId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        hospitalId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      }),
    }),
    401: Type.Object({
      message: Type.String(),
    }),
  },
};

export const RegisterSchema = {
  body: Type.Object({
    firstName: Type.String(),
    lastName: Type.String(),
    phoneNumber: Type.String(),
    password: Type.String(),
    role: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    hospitalId: Type.Optional(Type.String()),
  }),
  response: {
    201: Type.Object({
      message: Type.String(),
      userId: Type.String(),
    }),
  },
};
