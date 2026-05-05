import { Type } from '@sinclair/typebox';

export const BranchSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  location: Type.String(),
  manager: Type.String(),
  createdAt: Type.Optional(Type.String()),
  updatedAt: Type.Optional(Type.String()),
});

export const CreateBranchSchema = {
  body: Type.Object({
    name: Type.String(),
    location: Type.String(),
    manager: Type.String(),
  }),
  response: {
    201: BranchSchema,
  },
};

export const UpdateBranchSchema = {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    name: Type.Optional(Type.String()),
    location: Type.Optional(Type.String()),
    manager: Type.Optional(Type.String()),
  }),
  response: {
    200: BranchSchema,
  },
};

export const GetBranchSchema = {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: BranchSchema,
  },
};

export const ListBranchSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    location: Type.Optional(Type.String()),
    minPolicies: Type.Optional(Type.Number()),
    maxPolicies: Type.Optional(Type.Number()),
    minActivePolicies: Type.Optional(Type.Number()),
    maxActivePolicies: Type.Optional(Type.Number()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(Type.Object({
        branchId: Type.String(),
        branchName: Type.String(),
        totalMembers: Type.Number(),
        totalPolicies: Type.Number(),
        totalActivePolicies: Type.Number(),
        totalClaims: Type.Number(),
        location: Type.String(),
        managerName: Type.String(),
      })),
      total: Type.Number(),
    }),
  },
};
