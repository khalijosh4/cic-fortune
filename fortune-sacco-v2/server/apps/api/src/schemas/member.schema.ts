import { Type } from '@sinclair/typebox';

export const MemberSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  branchId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  policyId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  coverType: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  premiumRate: Type.String(),
  status: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedAnnualLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedOutpatientLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedInpatientLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedMaternityLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreateMemberSchema = {
  body: Type.Object({
    firstName: Type.String(),
    lastName: Type.String(),
    branchId: Type.Optional(Type.String()),
    policyId: Type.Optional(Type.String()),
    coverType: Type.Optional(Type.String()),
    premiumRate: Type.String(),
    status: Type.Optional(Type.String()),
  }),
  response: {
    201: MemberSchema,
  },
};

export const UpdateMemberSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    policyId: Type.Optional(Type.String()),
    coverType: Type.Optional(Type.String()),
    premiumRate: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
  }),
  response: {
    200: MemberSchema,
  },
};

export const ListMemberSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    branchId: Type.Optional(Type.String()),
    policyId: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(MemberSchema),
      total: Type.Number(),
    }),
  },
};
