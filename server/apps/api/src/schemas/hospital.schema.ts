import { Type } from '@sinclair/typebox';

export const HospitalSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  location: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  type: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  claimLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreateHospitalSchema = {
  body: Type.Object({
    name: Type.String(),
    location: Type.Optional(Type.String()),
    type: Type.Optional(Type.String()),
    claimLimit: Type.Optional(Type.String()),
  }),
  response: {
    201: HospitalSchema,
  },
};

export const UpdateHospitalSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    location: Type.Optional(Type.String()),
    type: Type.Optional(Type.String()),
    claimLimit: Type.Optional(Type.String()),
  }),
  response: {
    200: HospitalSchema,
  },
};

export const ListHospitalSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    location: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    'type[]': Type.Optional(Type.Array(Type.String())),
    minClaimLimit: Type.Optional(Type.Number()),
    maxClaimLimit: Type.Optional(Type.Number()),
    'claimLimitRange[]': Type.Optional(Type.Array(Type.Number())),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(HospitalSchema),
      total: Type.Number(),
    }),
  },
};
