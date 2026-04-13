import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import { InstitutionalSidebarContent } from "@/features/institutional/components/InstitutionalSidebarContent";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/common.types";

interface MobileHeaderProps {
    currentRole: UserRole;
    onLogout: () => void;
    userPlanId?: number;
    userId?: string;
}

export function MobileHeader({ currentRole, onLogout, userPlanId = 1, userId }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isInstitutional = currentRole === "institutional_admin" || currentRole === "institutional_professor";

    return (
        <div className={cn(
            "md:hidden flex items-center justify-between px-6 py-2 border-b fixed top-0 left-0 w-full z-40 h-14 transition-colors",
            isInstitutional ? "bg-[#020617] border-white/5" : "bg-white border-slate-100"
        )}>
            {!isInstitutional ? (
                <div className="flex items-center gap-2">
                    <img src={generatedImage} alt="Logo" className="h-8 w-8 object-contain p-1 rounded-lg bg-slate-50 border border-slate-100" />
                    <div>
                        <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight italic">ARG</h1>
                        <span className="text-[10px] font-bold text-violet-600 tracking-widest uppercase">Academy</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <h1 className="text-sm font-black italic uppercase tracking-tighter text-white">ARG <span className="text-orange-500">Station</span></h1>
                </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={isInstitutional ? "text-white" : "text-slate-900"}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none">
                    {isInstitutional ? (
                        <InstitutionalSidebarContent
                            currentRole={currentRole}
                            onLogout={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            onClose={() => setIsOpen(false)}
                        />
                    ) : (
                        <SidebarContent
                            currentRole={currentRole}
                            onLogout={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            userPlanId={userPlanId}
                            onClose={() => setIsOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
