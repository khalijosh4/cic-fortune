import { Type } from '@sinclair/typebox';

export const LineOfBusinessSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  code: Type.String(),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  icon: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  isActive: Type.Boolean(),
  createdAt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  updatedAt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreateLineOfBusinessSchema = {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    code: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    icon: Type.Optional(Type.String()),
  }),
  response: {
    201: LineOfBusinessSchema,
  },
};

export const UpdateLineOfBusinessSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    code: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    icon: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean()),
  }),
  response: {
    200: LineOfBusinessSchema,
  },
};

export const ListLineOfBusinessSchema = {
  response: {
    200: Type.Object({
      data: Type.Array(LineOfBusinessSchema),
      total: Type.Number(),
    }),
  },
};

export const GetLineOfBusinessSchema = {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: LineOfBusinessSchema,
  },
};
