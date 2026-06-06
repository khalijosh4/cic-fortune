import { Type } from '@sinclair/typebox';

export const PlanSchema = Type.Object({
  id: Type.String(),
  planName: Type.String(),
  inpatientLimit: Type.String(),
  outpatientLimit: Type.String(),
  maternityLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dentalLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  opticalLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  lastExpenseLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  m0: Type.String(),
  m1: Type.String(),
  m2: Type.String(),
  m3: Type.String(),
  m4: Type.String(),
  m5: Type.String(),
  m6: Type.String(),
  extra: Type.String(),
});

export const CreatePlanSchema = {
  body: Type.Object({
    planName: Type.String(),
    lobId: Type.Optional(Type.String()),
    inpatientLimit: Type.String(),
    outpatientLimit: Type.String(),
    maternityLimit: Type.Optional(Type.String()),
    dentalLimit: Type.Optional(Type.String()),
    opticalLimit: Type.Optional(Type.String()),
    lastExpenseLimit: Type.Optional(Type.String()),
    m0: Type.String(),
    m1: Type.String(),
    m2: Type.String(),
    m3: Type.String(),
    m4: Type.String(),
    m5: Type.String(),
    m6: Type.String(),
    extra: Type.String(),
  }),
  response: {
    201: PlanSchema,
  },
};

export const UpdatePlanSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    planName: Type.Optional(Type.String()),
    inpatientLimit: Type.Optional(Type.String()),
    outpatientLimit: Type.Optional(Type.String()),
    maternityLimit: Type.Optional(Type.String()),
    dentalLimit: Type.Optional(Type.String()),
    opticalLimit: Type.Optional(Type.String()),
    lastExpenseLimit: Type.Optional(Type.String()),
    m0: Type.Optional(Type.String()),
    m1: Type.Optional(Type.String()),
    m2: Type.Optional(Type.String()),
    m3: Type.Optional(Type.String()),
    m4: Type.Optional(Type.String()),
    m5: Type.Optional(Type.String()),
    m6: Type.Optional(Type.String()),
    extra: Type.Optional(Type.String()),
  }),
  response: {
    200: PlanSchema,
  },
};

export const ListPlanSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    planName: Type.Optional(Type.String()),
    lobId: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(PlanSchema),
      total: Type.Number(),
    }),
  },
};
