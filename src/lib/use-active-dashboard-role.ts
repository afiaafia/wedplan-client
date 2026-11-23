"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  getDefaultDashboardRole,
  isUserRole,
  type UserRole,
} from "./roles";
import {
  getDashboardRoleFromPath,
  getSessionActiveRole,
  setSessionActiveRole,
  subscribeToActiveRoleChanges,
} from "./active-role";

export function useActiveDashboardRole(
  sessionId: string | null,
  rolesKey: string,
  pathname: string
): UserRole | null {
  const roles = useMemo(
    () => rolesKey.split("|").filter(isUserRole),
    [rolesKey]
  );
  const routeRole = getDashboardRoleFromPath(pathname);
  const storedRole = useSyncExternalStore(
    subscribeToActiveRoleChanges,
    () => (sessionId ? getSessionActiveRole(sessionId, roles) : null),
    () => null
  );

  useEffect(() => {
    if (sessionId && routeRole && roles.includes(routeRole)) {
      setSessionActiveRole(sessionId, routeRole, roles);
    }
  }, [roles, routeRole, sessionId]);

  if (roles.includes("admin")) return "admin";
  if (routeRole && roles.includes(routeRole)) return routeRole;
  if (storedRole && roles.includes(storedRole)) return storedRole;

  return getDefaultDashboardRole(roles);
}
