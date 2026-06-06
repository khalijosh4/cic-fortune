import { Type } from '@sinclair/typebox';

export const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.Optional(Type.String()),
});

export const MemberSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  phoneNumber: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  branchId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  planId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  coverType: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dependentsCount: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  premiumRate: Type.String(),
  status: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedAnnualLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedOutpatientLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedInpatientLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  usedMaternityLimit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  branchName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const CreateMemberSchema = {
  body: Type.Object({
    firstName: Type.String(),
    lastName: Type.String(),
    email: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    planId: Type.Optional(Type.String()),
    lobId: Type.Optional(Type.String()),
    coverType: Type.Optional(Type.String()),
    dependentsCount: Type.Optional(Type.Number()),
    status: Type.Optional(Type.String()),
  }),
  response: {
    201: MemberSchema,
    400: ErrorResponse,
    403: ErrorResponse,
    500: ErrorResponse,
  },
};

export const UpdateMemberSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    planId: Type.Optional(Type.String()),
    coverType: Type.Optional(Type.String()),
    dependentsCount: Type.Optional(Type.Number()),
    status: Type.Optional(Type.String()),
  }),
  response: {
    200: MemberSchema,
    403: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse,
  },
};

export const ListMemberSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    branchId: Type.Optional(Type.String()),
    planId: Type.Optional(Type.String()),
    lobId: Type.Optional(Type.String()),
    coverType: Type.Optional(Type.String()),
    'coverType[]': Type.Optional(Type.Array(Type.String())),
    minPremiumRate: Type.Optional(Type.Number()),
    maxPremiumRate: Type.Optional(Type.Number()),
    'premiumRange[]': Type.Optional(Type.Array(Type.Number())),
    status: Type.Optional(Type.String()),
    'status[]': Type.Optional(Type.Array(Type.String())),
    name: Type.Optional(Type.String()),
    branchName: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(MemberSchema),
      total: Type.Number(),
    }),
  },
};
