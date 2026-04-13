
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Target,
  User,
  Home,
  Menu,
  Code
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";
import { InstitutionalSidebarContent } from "@/features/institutional/components/InstitutionalSidebarContent";
import { useState } from "react";

import { UserRole } from "@/types/common.types";

interface MobileNavProps {
  currentRole: UserRole;
  onLogout: () => void;
  userPlanId?: number;
  userId?: string;
}

export function MobileNav({ currentRole, onLogout, userPlanId = 1, userId }: MobileNavProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isInstitutional = currentRole === "institutional_admin" || currentRole === "institutional_professor";

  const studentLinks = [
    { href: "/dashboard", icon: Home, label: "Inicio" },
    { href: "/missions", icon: Trophy, label: "Misiones" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  const adminLinks = [
    { href: "/admin", icon: Home, label: "Panel" },
    { href: "/admin/users", icon: User, label: "Usuarios" },
  ];

  const institutionalLinks = [
    { href: "/institucional-dashboard", icon: Home, label: "Base" },
    { href: "/lab", icon: Code, label: "Labs" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  const links = currentRole === "admin" ? adminLinks :
    currentRole === "superadmin" ? adminLinks :
      currentRole === "professor" ? studentLinks :
        isInstitutional ? institutionalLinks :
          studentLinks;

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 w-full border-t px-4 pb-6 pt-2 z-40 transition-colors shadow-2xl",
      isInstitutional ? "bg-[#020617] border-white/5" : "bg-white/90 backdrop-blur-xl border-slate-100"
    )}>
      <div className="flex justify-around items-center h-12">
        {links.slice(0, 3).map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all",
                  isActive 
                    ? (isInstitutional ? "text-orange-500 bg-orange-500/10" : "text-violet-600 bg-violet-50")
                    : (isInstitutional ? "text-slate-600" : "text-slate-400")
                )}
              >
                <link.icon className={cn("h-6 w-6", isActive && !isInstitutional ? "fill-violet-600/10" : "")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Menu Toggle for Full Sidebar */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all cursor-pointer",
                isInstitutional ? "text-slate-600 hover:text-orange-400" : "text-slate-400 hover:text-violet-600"
              )}
            >
              <Menu className="h-6 w-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Menú
              </span>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-none">
            {isInstitutional ? (
              <InstitutionalSidebarContent
                currentRole={currentRole}
                onLogout={() => {
                  onLogout();
                  setOpen(false);
                }}
                onClose={() => setOpen(false)}
              />
            ) : (
              <SidebarContent
                currentRole={currentRole as any}
                onLogout={() => {
                  onLogout();
                  setOpen(false);
                }}
                userPlanId={userPlanId}
                onClose={() => setOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div >
  );
}
