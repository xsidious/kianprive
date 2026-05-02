import { Role } from "@prisma/client";

const adminRoles = new Set<Role>([Role.ADMIN, Role.OPERATIONS, Role.EDITOR]);

export function canAccessAdmin(role?: Role | null) {
  if (!role) return false;
  return adminRoles.has(role);
}

export function canPublishContent(role?: Role | null) {
  if (!role) return false;
  return role === Role.ADMIN || role === Role.EDITOR;
}

export function canManageOrders(role?: Role | null) {
  if (!role) return false;
  return role === Role.ADMIN || role === Role.OPERATIONS;
}
