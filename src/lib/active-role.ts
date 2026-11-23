import {
  getDefaultDashboardRole,
  getRoleDashboard,
  isUserRole,
  type UserRole,
} from "./roles.ts";

const ACTIVE_ROLE_STORAGE_KEY = "wedplan.active-role";
const ACTIVE_ROLE_CHANGE_EVENT = "wedplan:active-role-change";

type ActiveRoleStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type ActiveRoleRecord = {
  sessionId: string;
  role: UserRole;
};

export function getDashboardRoleFromPath(
  path: string | null | undefined
): UserRole | null {
  const pathname = path?.split(/[?#]/, 1)[0] ?? "";
  const role = pathname.match(
    /^\/dashboard\/(customer|vendor|admin)(?:\/|$)/
  )?.[1];

  return isUserRole(role) ? role : null;
}

export function resolvePostAuthDestination(
  roles: readonly UserRole[],
  callbackPath: string | null,
  preferredRole?: UserRole
): { activeRole: UserRole | null; target: string } {
  if (roles.includes("admin")) {
    const callbackRole = getDashboardRoleFromPath(callbackPath);
    const target =
      callbackRole && callbackRole !== "admin"
        ? null
        : callbackPath;
    return {
      activeRole: "admin",
      target: target ?? getRoleDashboard("admin"),
    };
  }

  const callbackRole = getDashboardRoleFromPath(callbackPath);
  if (preferredRole && roles.includes(preferredRole)) {
    if (callbackRole && callbackRole !== preferredRole) {
      return {
        activeRole: preferredRole,
        target: getRoleDashboard(preferredRole),
      };
    }

    const callbackIsDashboardRoot =
      callbackPath?.split(/[?#]/, 1)[0] === "/dashboard";
    return {
      activeRole: preferredRole,
      target:
        callbackPath && !callbackIsDashboardRoot
          ? callbackPath
          : getRoleDashboard(preferredRole),
    };
  }

  if (callbackRole && roles.includes(callbackRole)) {
    return { activeRole: callbackRole, target: callbackPath! };
  }

  if (callbackPath) return { activeRole: null, target: callbackPath };

  const activeRole = getDefaultDashboardRole(roles);
  return activeRole
    ? { activeRole, target: getRoleDashboard(activeRole) }
    : { activeRole: null, target: "/dashboard" };
}

export function readActiveRoleSelection(
  storage: ActiveRoleStorage,
  sessionId: string,
  roles: readonly UserRole[]
): UserRole | null {
  const value = storage.getItem(ACTIVE_ROLE_STORAGE_KEY);
  if (!value) return null;

  let record: Partial<ActiveRoleRecord>;
  try {
    record = JSON.parse(value) as Partial<ActiveRoleRecord>;
  } catch {
    storage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    return null;
  }

  if (
    record.sessionId !== sessionId ||
    !isUserRole(record.role) ||
    !roles.includes(record.role) ||
    (roles.includes("admin") && record.role !== "admin")
  ) {
    storage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    return null;
  }

  return record.role;
}

export function saveActiveRoleSelection(
  storage: ActiveRoleStorage,
  sessionId: string,
  role: UserRole,
  roles: readonly UserRole[]
): boolean {
  if (
    !sessionId ||
    !roles.includes(role) ||
    (roles.includes("admin") && role !== "admin")
  ) {
    return false;
  }

  const record: ActiveRoleRecord = { sessionId, role };
  storage.setItem(ACTIVE_ROLE_STORAGE_KEY, JSON.stringify(record));
  return true;
}

export function clearActiveRoleSelection(storage: ActiveRoleStorage): void {
  storage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getSessionActiveRole(
  sessionId: string,
  roles: readonly UserRole[]
): UserRole | null {
  if (roles.includes("admin")) return "admin";
  const storage = getBrowserStorage();
  if (!storage) return null;

  try {
    return readActiveRoleSelection(storage, sessionId, roles);
  } catch {
    return null;
  }
}

export function setSessionActiveRole(
  sessionId: string,
  role: UserRole,
  roles: readonly UserRole[]
): boolean {
  const storage = getBrowserStorage();
  if (!storage) return false;

  try {
    const saved = saveActiveRoleSelection(storage, sessionId, role, roles);
    if (saved) {
      window.dispatchEvent(new Event(ACTIVE_ROLE_CHANGE_EVENT));
    }
    return saved;
  } catch {
    return false;
  }
}

export function clearSessionActiveRole(): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    clearActiveRoleSelection(storage);
    window.dispatchEvent(new Event(ACTIVE_ROLE_CHANGE_EVENT));
  } catch {
    return;
  }
}

export function subscribeToActiveRoleChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(ACTIVE_ROLE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ACTIVE_ROLE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
