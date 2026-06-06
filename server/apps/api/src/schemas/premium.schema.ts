import { Type } from '@sinclair/typebox';

export const PremiumSchema = Type.Object({
  id: Type.String(),
  memberId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  amountDue: Type.String(),
  amountPaid: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dueDate: Type.String(), // timestamp as ISO string
  paymentMethod: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  createdAt: Type.Optional(Type.Union([Type.String(), Type.Null()])) 
});

export const CreatePremiumSchema = {
  body: Type.Object({
    memberId: Type.String(),
    amountDue: Type.String(),
    dueDate: Type.String(),
    lobId: Type.Optional(Type.String()),
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
    lobId: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    'status[]': Type.Optional(Type.Array(Type.String())),
    minAmountDue: Type.Optional(Type.Number()),
    maxAmountDue: Type.Optional(Type.Number()),
    'amountDueRange[]': Type.Optional(Type.Array(Type.Number())),
    minAmountPaid: Type.Optional(Type.Number()),
    maxAmountPaid: Type.Optional(Type.Number()),
    'amountPaidRange[]': Type.Optional(Type.Array(Type.Number())),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
    'dueDateRange[]': Type.Optional(Type.Array(Type.String())),
    name: Type.Optional(Type.String()),
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
