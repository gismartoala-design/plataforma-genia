
import React from 'react';
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Shield,
    Book,
    Users,
    Code,
    GraduationCap,
    FileText,
    Settings,
    LogOut,
    Building2,
    Cpu,
    Activity,
    LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import '@/features/institutional/styles/ConstructionTheme.css';

import { InstitutionalSidebarContent } from './InstitutionalSidebarContent';

interface InstitutionalSidebarProps {
    currentRole: "institutional_admin" | "institutional_professor" | "profesor_vista";
    onLogout: () => void;
    onClose?: () => void;
}

export function InstitutionalSidebar({ currentRole, onLogout, onClose }: InstitutionalSidebarProps) {
    return (
        <div className="hidden md:flex flex-col w-[280px] h-screen bg-[var(--inst-navy)] fixed left-0 top-0 z-50 border-r border-white/5 shadow-2xl overflow-hidden font-sans text-white">
            {/* Theme Background Elements */}
            <div className="absolute inset-0 construction-grid opacity-10 pointer-events-none" />
            <div className="absolute inset-0 scaffold-lines opacity-10 pointer-events-none" />
            
            <InstitutionalSidebarContent 
                currentRole={currentRole} 
                onLogout={onLogout} 
                onClose={onClose} 
            />
        </div>
    );
}
