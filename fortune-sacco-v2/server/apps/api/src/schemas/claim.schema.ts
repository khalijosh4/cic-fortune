import { Type } from '@sinclair/typebox';

export const ClaimSchema = Type.Object({
  id: Type.String(),
  memberId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  hospitalId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  policyId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  amountClaimed: Type.String(),
  amountApproved: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  status: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  diagnosis: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  createdAt: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreateClaimSchema = {
  body: Type.Object({
    memberId: Type.String(),
    hospitalId: Type.String(),
    policyId: Type.String(),
    amountClaimed: Type.String(),
    diagnosis: Type.Optional(Type.String()),
  }),
  response: {
    201: ClaimSchema,
  },
};

export const ApproveClaimSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    amountApproved: Type.String(),
  }),
  response: {
    200: ClaimSchema,
  },
};

export const RejectClaimSchema = {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: ClaimSchema,
  },
};

export const ListClaimSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    memberId: Type.Optional(Type.String()),
    hospitalId: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    minAmountClaimed: Type.Optional(Type.Number()),
    maxAmountClaimed: Type.Optional(Type.Number()),
    minAmountApproved: Type.Optional(Type.Number()),
    maxAmountApproved: Type.Optional(Type.Number()),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(ClaimSchema),
      total: Type.Number(),
    }),
  },
};
export const UpdateClaimSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Partial(Type.Object({
    amountClaimed: Type.String(),
    amountApproved: Type.String(),
    status: Type.String(),
    diagnosis: Type.String(),
  })),
  response: {
    200: ClaimSchema,
  },
};
