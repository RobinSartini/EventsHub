import { z } from "zod";

export const userRoles = ["user", "admin"] as const;
export const userStatuses = ["active", "suspended"] as const;

export const listUsersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserBody = z
  .object({
    role: z.enum(userRoles).optional(),
    status: z.enum(userStatuses).optional(),
  })
  .strict()
  .refine((body) => body.role !== undefined || body.status !== undefined, {
    message: "Provide role or status",
  });

export type ListUsersQuery = z.infer<typeof listUsersQuery>;
export type UpdateUserBody = z.infer<typeof updateUserBody>;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: (typeof userRoles)[number];
  status: (typeof userStatuses)[number];
  createdAt: string;
};

export type AdminUserListResponse = {
  items: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
