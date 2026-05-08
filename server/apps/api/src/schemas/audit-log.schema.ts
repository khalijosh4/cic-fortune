import { Type } from '@sinclair/typebox';

export const AuditLogSchema = Type.Object({
  id: Type.String(),
  timestamp: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  userEmail: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  userRole: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  branchName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  action: Type.String(),
  module: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  ipAddress: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  status: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  type: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  entityId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  entityType: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  details: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const ListAuditLogSchema = {
  querystring: Type.Object({
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    module: Type.Optional(Type.String()),
    'module[]': Type.Optional(Type.Array(Type.String())),
    type: Type.Optional(Type.String()),
    'type[]': Type.Optional(Type.Array(Type.String())),
    status: Type.Optional(Type.String()),
    'status[]': Type.Optional(Type.Array(Type.String())),
    userRole: Type.Optional(Type.String()),
    'userRole[]': Type.Optional(Type.Array(Type.String())),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
    'timestampRange[]': Type.Optional(Type.Array(Type.String())),
    action: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(AuditLogSchema),
      total: Type.Number(),
    }),
  },
};
export const GetAuditLogSchema = {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: AuditLogSchema,
  },
};
