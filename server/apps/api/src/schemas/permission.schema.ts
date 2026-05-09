import { Type } from '@sinclair/typebox';

export const PermissionSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  resource: Type.String(),
  action: Type.String(),
});

export const ListPermissionSchema = {
  response: {
    200: Type.Object({
      data: Type.Array(PermissionSchema),
    }),
  },
};
