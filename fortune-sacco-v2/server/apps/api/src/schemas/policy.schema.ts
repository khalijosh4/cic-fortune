import { Type } from '@sinclair/typebox';

export const PolicySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  annualLimit: Type.String(),
  outpatientLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  inpatientLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  maternityLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  status: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreatePolicySchema = {
  body: Type.Object({
    name: Type.String(),
    annualLimit: Type.String(),
    outpatientLimit: Type.Optional(Type.String()),
    inpatientLimit: Type.Optional(Type.String()),
    maternityLimit: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
  }),
  response: {
    201: PolicySchema,
  },
};

export const UpdatePolicySchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    annualLimit: Type.Optional(Type.String()),
    outpatientLimit: Type.Optional(Type.String()),
    inpatientLimit: Type.Optional(Type.String()),
    maternityLimit: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
  }),
  response: {
    200: PolicySchema,
  },
};

export const ListPolicySchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(PolicySchema),
      total: Type.Number(),
    }),
  },
};
