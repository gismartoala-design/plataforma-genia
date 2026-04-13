import { SidebarContent } from "./SidebarContent";

type Role = "student" | "admin" | "professor" | "superadmin" | "kids" | "kids_professor" | "institutional_admin" | "institutional_professor" | "profesor_vista" | "profesor_latam" | "estudiante_latam";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
  userPlanId?: number;
  userId?: string;
}

export function Sidebar({ currentRole, onLogout, userPlanId = 1, userId }: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-[280px] h-screen bg-white fixed left-0 top-0 z-50 border-r border-slate-100 shadow-xl">
      <SidebarContent
        currentRole={currentRole}
        onLogout={onLogout}
        userPlanId={userPlanId}
        userId={userId}
      />
    </div>
  );
}
