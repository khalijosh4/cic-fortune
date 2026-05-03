import { Type } from '@sinclair/typebox';

export const PremiumSchema = Type.Object({
  id: Type.String(),
  memberId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  amountDue: Type.String(),
  amountPaid: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dueDate: Type.String(), // timestamp as ISO string
  paymentMethod: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreatePremiumSchema = {
  body: Type.Object({
    memberId: Type.String(),
    amountDue: Type.String(),
    dueDate: Type.String(),
  }),
  response: {
    201: PremiumSchema,
  },
};

export const PayPremiumSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    amountPaid: Type.String(),
    paymentMethod: Type.Optional(Type.String()),
  }),
  response: {
    200: PremiumSchema,
  },
};

export const ListPremiumSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    memberId: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(PremiumSchema),
      total: Type.Number(),
    }),
  },
};
export const GetPremiumSchema = {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: PremiumSchema,
  },
};
export const UpdatePremiumSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Partial(Type.Object({
    amountDue: Type.String(),
    amountPaid: Type.String(),
    dueDate: Type.String(),
    paymentMethod: Type.String(),
  })),
  response: {
    200: PremiumSchema,
  },
};
