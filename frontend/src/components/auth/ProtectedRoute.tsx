import { ReactNode } from "react";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  user: any;
  allowedRoles?: string[];
  allowedRoleIds?: number[];
  children: ReactNode;
}

export const getDashboardRoute = (user: any) => {
  if (!user) return "/instituciones-login";
  if (user.role === "superadmin" || user.role === "admin") return "/admin";
  if (user.role === "institutional_admin") return "/institucional-dashboard";
  if (user.role === "institutional_professor" || user.roleId === 9) return "/institucional-teach";
  if (user.roleId === 13) return "/institucional-tutor";
  if (user.role === "professor") return "/teach";
  if (user.role === "kids_professor" || user.roleId === 7) return "/kids-teach";
  if (user.role === "kids") return "/kids-dashboard";
  if (user.role === "profesor_latam") return "/latam-teach";
  if (user.role === "estudiante_latam") return "/latam-dashboard";
  if (user.institucionId) return "/city-dashboard";
  return "/city-dashboard";
};

export const ProtectedRoute = ({ user, allowedRoles, allowedRoleIds, children }: ProtectedRouteProps) => {
  if (!user) {
    return <Redirect to="/instituciones-login" />;
  }

  let isAllowed = false;
  if (!allowedRoles && !allowedRoleIds) {
    isAllowed = true; // Just requires authentication
  } else {
    if (allowedRoles && allowedRoles.includes(user.role)) {
        isAllowed = true;
    }
    if (allowedRoleIds && user.roleId && allowedRoleIds.includes(user.roleId)) {
        isAllowed = true;
    }
  }

  if (!isAllowed) {
    // Role not authorized, fallback to correct dashboard
    return <Redirect to={getDashboardRoute(user)} />;
  }

  return <>{children}</>;
};
