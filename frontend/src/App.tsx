
import { Switch, Route, Redirect, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import StudentDashboard3D from "@/pages/StudentDashboard3D";
import Leaderboard from "@/features/leaderboard/components/Leaderboard";
import Missions from "@/pages/Missions";
import NotFound from "@/pages/not-found";
import { StudentDashboard, LevelViewer, WorldSelector } from "@/features/student";
import { AdminDashboard } from "@/features/admin";
import { ProfessorDashboard, CourseEditor, FileSystem, GradingDashboard } from "@/features/professor";
import { CodingLab, ArduinoLab } from "@/features/labs";
import { Login, KidsLogin, InstitutionalLogin } from "@/features/auth";
import { KidsDashboard, KidsActivityViewer, KidsModuleViewer } from "@/features/kids";
import { KidsProfessorDashboard, KidsCourseEditor, KidsModuleEditor } from "@/features/kids-professor";
import { Button } from "@/components/ui/button";
import { CityDashboard, InstitutionalDashboard, InstitutionalTeacherDashboard, InstitutionalTutorDashboard, InstitutionalModuleEditor, InstitutionalSidebar, InstitutionalGradesView, TechToolViewer, WebBuilderLab, MinecraftCodeLab, ChatbotBuilderLab, ActionPlatformerLab, ArduinoWokwiLab } from "@/features/institutional";
import { LatamLogin, LatamStudentDashboard, LatamTeacherDashboard, LatamSessionViewer } from "@/features/latam";
import { Profile } from "@/features/profile";
import { AITutor, ProCourses } from "@/features/courses";
import { GamerRaffle, MissionsHub } from "@/features/gamification";
// import { SuperAdminDashboard } from "@/features/superadmin"; // Removido por unificación
import { Toaster } from "@/components/ui/toaster";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { notificationService } from "@/services/notification.service";
import AsistenteWeb from "@/pages/AsistenteWeb";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, PhoneCall } from "lucide-react";
import { UserRole } from "@/types/common.types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  const [user, setUser] = useState<{
    role: UserRole;
    name: string;
    id: string;
    roleId?: number;
    plan?: string;
    institucionId?: number;
    cursoId?: number;
  } | null>(() => {
    // Initialize state from local storage
    const savedUser = localStorage.getItem("edu_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("edu_token");
  });
  const [location, setLocation] = useLocation();
  const [isSuspended, setIsSuspended] = useState(false);
  const [forceHideNav, setForceHideNav] = useState(false);

  const clearSession = () => {
    const isInstitutional = user?.role === "institutional_admin" || user?.role === "institutional_professor" || !!user?.institucionId;
    const isKids = user?.role === "kids" || user?.role === "kids_professor";
    const isLatam = user?.role === "profesor_latam" || user?.role === "estudiante_latam";

    setUser(null);
    setToken(null);
    setIsSuspended(false);
    localStorage.removeItem("edu_user");
    localStorage.removeItem("edu_token");

    if (isKids) {
      setLocation("/login-kids");
    } else if (isLatam) {
      setLocation("/latam-login");
    } else {
      setLocation("/instituciones-login");
    }
  };

  useEffect(() => {
    if (user) {
      notificationService.requestPermission();
    }

    const handleSuspension = () => {
      setIsSuspended(true);
      setToken(null);
      localStorage.removeItem("edu_token");
    };

    const handleAuthExpired = () => {
      clearSession();
    };

    const handleForceHideNav = (e: CustomEvent) => {
      setForceHideNav(!!e.detail);
    };

    window.addEventListener('account:suspended', handleSuspension);
    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('nav:force-hide', handleForceHideNav as EventListener);

    return () => {
      window.removeEventListener('account:suspended', handleSuspension);
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('nav:force-hide', handleForceHideNav as EventListener);
    };
  }, [user]);

  const handleLogin = (
    role: "student" | "admin" | "professor" | "superadmin" | "kids" | "kids_professor" | "institutional_admin" | "institutional_professor" | "profesor_latam" | "estudiante_latam",
    name: string,
    id: string,
    planId?: number,
    accessToken?: string,
    institucionId?: number,
    roleId?: number,
    cursoId?: number
  ) => {
    console.log('[App] handleLogin called with:', { role, id, institucionId, roleId, cursoId });
    const userData = { role, name, id, roleId, plan: planId ? planId.toString() : undefined, institucionId, cursoId };
    console.log('[App] Final userData object:', userData);
    setIsSuspended(false);
    setUser(userData);
    localStorage.setItem("edu_user", JSON.stringify(userData));

    if (accessToken) {
      console.log('[App] Saving accessToken to localStorage under edu_token');
      setToken(accessToken);
      localStorage.setItem("edu_token", accessToken);
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  // If not logged in and not on login page or asistente-web, redirect to login
  if (!user && location !== "/login" && location !== "/login-kids" && location !== "/instituciones-login" && location !== "/latam-login" && location !== "/asistente-web" && location !== "/ayuda") {
    return <Redirect to="/instituciones-login" />;
  }

  const isManagementRoute = location.startsWith("/admin") || location.startsWith("/superadmin");
  const isLevelRoute = location.startsWith("/level");
  
  const showNav = !forceHideNav && user && location !== "/login" && location !== "/login-kids" && !location.startsWith("/kids-dashboard") && location !== "/lab" && location !== "/arduino-lab" && !isManagementRoute && !isLevelRoute && !location.startsWith("/latam") && !location.startsWith("/institucional-editor");

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {showNav && (
        <>
          {(user.role === "institutional_admin" || user.role === "institutional_professor" || user.institucionId) ? (
            <InstitutionalSidebar
              currentRole={user.role as any}
              onLogout={handleLogout}
            />
          ) : (
            <Sidebar
              currentRole={user.role as any}
              onRoleChange={(r) => setUser({ ...user, role: r })}
              onLogout={handleLogout}
              userPlanId={user.plan ? parseInt(user.plan) : 1}
              userId={user.id}
            />
          )}
          <MobileHeader
            currentRole={user!.role}
            onLogout={handleLogout}
            userPlanId={user!.plan ? parseInt(user!.plan) : 1}
            userId={user?.id?.toString()}
          />
          <MobileNav
            currentRole={user!.role}
            onLogout={handleLogout}
            userPlanId={user!.plan ? parseInt(user!.plan) : 1}
            userId={user?.id?.toString()}
          />
        </>
      )}

      <main className={cn(
        "flex-1 min-h-screen",
        showNav ? "md:ml-70 pt-14 md:pt-0 pb-24 md:pb-0" : ""
      )}>
        <Switch>
          {/* Public Routes - No login required */}
          <Route path="/asistente-web">
            <AsistenteWeb />
          </Route>
          <Route path="/ayuda">
            <AsistenteWeb />
          </Route>

          <Route path="/login">
            {user ? <Redirect to="/" /> : <Login onLogin={handleLogin} />}
          </Route>

          <Route path="/login-kids">
            {user ? <Redirect to="/" /> : <KidsLogin onLogin={handleLogin} onSwitchToNormal={() => setLocation("/login")} />}
          </Route>

          <Route path="/instituciones-login">
            {user ? <Redirect to="/" /> : <InstitutionalLogin onLogin={handleLogin} onSwitchToNormal={() => setLocation("/login")} />}
          </Route>

          <Route path="/latam-login">
            {user ? <Redirect to="/" /> : <LatamLogin onLogin={handleLogin} onSwitchToNormal={() => setLocation("/login")} />}
          </Route>

          <Route path="/">
            {!user ? <Redirect to="/instituciones-login" /> :
              user.role === "superadmin" || user.role === "admin" ? <Redirect to="/admin" /> :
                user.role === "institutional_admin" ? <Redirect to="/institucional-dashboard" /> :
                  user.role === "institutional_professor" || user.roleId === 9 ? <Redirect to="/institucional-teach" /> :
                    user.roleId === 13 ? <Redirect to="/institucional-tutor" /> :
                      user.role === "professor" ? <Redirect to="/teach" /> :
                        user.role === "kids_professor" ? <Redirect to="/kids-teach" /> :
                          user.role === "kids" ? <Redirect to="/kids-dashboard" /> :
                            user.role === "profesor_latam" ? <Redirect to="/latam-teach" /> :
                              user.role === "estudiante_latam" ? <Redirect to="/latam-dashboard" /> :
                                user.institucionId ? <Redirect to="/city-dashboard" /> :
                                  <Redirect to="/city-dashboard" />}
          </Route>

          <Route path="/kids-dashboard">
            <ProtectedRoute user={user} allowedRoles={["kids"]}>
              <KidsDashboard user={user} />
            </ProtectedRoute>
          </Route>

          <Route path="/kids-teach">
            <ProtectedRoute user={user} allowedRoles={["kids_professor"]} allowedRoleIds={[7]}>
              <KidsProfessorDashboard user={user!} />
            </ProtectedRoute>
          </Route>

          <Route path="/kids/play/:id">
            {(params: any) => params ? (
              <ProtectedRoute user={user} allowedRoles={["kids"]}>
                <KidsModuleViewer user={user!} moduleId={Number(params.id)} />
              </ProtectedRoute>
            ) : null}
          </Route>

          <Route path="/kids-teach/editor">
            <ProtectedRoute user={user} allowedRoles={["kids_professor"]} allowedRoleIds={[7]}>
              <KidsCourseEditor user={user!} />
            </ProtectedRoute>
          </Route>

          <Route path="/profile">
            <Profile user={user!} />
          </Route>

          <Route path="/dashboard">
            <WorldSelector user={user!} />
          </Route>
          <Route path="/dashboard/module/:moduleId">
            <StudentDashboard user={user!} />
          </Route>
          <Route path="/dashboard-3d">
            <StudentDashboard3D user={user!} />
          </Route>
          <Route path="/admin/:tab?">
            <ProtectedRoute user={user} allowedRoles={["superadmin", "admin"]}>
              <AdminDashboard user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          </Route>
          <Route path="/superadmin/:tab?">
            <ProtectedRoute user={user} allowedRoles={["superadmin"]}>
              <AdminDashboard user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          </Route>
          <Route path="/teach">
            <ProtectedRoute user={user} allowedRoles={["professor"]}>
              <ProfessorDashboard user={user!} />
            </ProtectedRoute>
          </Route>
          <Route path="/teach/grading">
            <ProtectedRoute user={user} allowedRoles={["professor"]}>
              <GradingDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/teach/module/:id">
            {(params: any) => params ? (
              <ProtectedRoute user={user} allowedRoles={["professor"]}>
                <CourseEditor />
              </ProtectedRoute>
            ) : null}
          </Route>
          <Route path="/files">
            <FileSystem user={user!} />
          </Route>

          <Route path="/institucional-dashboard">
            <ProtectedRoute user={user} allowedRoles={["institutional_admin"]}>
              <InstitutionalDashboard user={user!} />
            </ProtectedRoute>
          </Route>

          <Route path="/institucional-teach">
            <ProtectedRoute user={user} allowedRoles={["institutional_professor"]} allowedRoleIds={[9]}>
              <InstitutionalTeacherDashboard user={user!} />
            </ProtectedRoute>
          </Route>

          <Route path="/institucional-notas">
            <ProtectedRoute user={user} allowedRoles={["institutional_admin", "institutional_professor"]} allowedRoleIds={[9, 13]}>
              <InstitutionalGradesView />
            </ProtectedRoute>
          </Route>

          <Route path="/institucional-tutor">
            <ProtectedRoute user={user} allowedRoleIds={[13]}>
              <InstitutionalTutorDashboard user={user!} />
            </ProtectedRoute>
          </Route>

          <Route path="/institucional-editor/:moduleId">
            <ProtectedRoute user={user} allowedRoles={["institutional_admin", "institutional_professor"]} allowedRoleIds={[9, 13]}>
              <InstitutionalModuleEditor />
            </ProtectedRoute>
          </Route>

          <Route path="/latam-dashboard">
            <ProtectedRoute user={user} allowedRoles={["estudiante_latam"]}>
              <LatamStudentDashboard user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          </Route>

          <Route path="/latam-teach">
            <ProtectedRoute user={user} allowedRoles={["profesor_latam"]}>
              <LatamTeacherDashboard user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          </Route>

          <Route path="/latam/session/:id">
            {(params: any) => params ? (
              <ProtectedRoute user={user} allowedRoles={["estudiante_latam", "profesor_latam"]}>
                <LatamSessionViewer sessionId={params.id} onClose={() => setLocation('/latam-dashboard')} />
              </ProtectedRoute>
            ) : null}
          </Route>

          <Route path="/city-dashboard">
            <CityDashboard user={user!} />
          </Route>

          <Route path="/city/challenge/:id" component={TechToolViewer} />

          {/* Rutas de Hub de Laboratorios */}
          <Route path="/lab-python" component={() => <CodingLab />} />
          <Route path="/lab-arduino">
            <ArduinoWokwiLab backHref={
              user?.role === 'institutional_admin' ? '/institucional-dashboard' :
                user?.role === 'institutional_professor' ? '/institucional-teach' :
                  user?.institucionId ? '/city-dashboard' :
                    '/city-dashboard'
            } />
          </Route>
          <Route path="/lab-web" component={() => <WebBuilderLab />} />
          <Route path="/lab-minecraft" component={() => <MinecraftCodeLab />} />
          <Route path="/lab-chatbot" component={() => <ChatbotBuilderLab />} />
          <Route path="/lab-qa" component={() => <ActionPlatformerLab />} />

          <Route path="/lab" component={CodingLab} />
          <Route path="/arduino-lab" component={ArduinoLab} />
          <Route path="/quests" component={MissionsHub} />
          <Route path="/missions" component={MissionsHub} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/ai-tutor" component={AITutor} />
          <Route path="/pro-courses" component={ProCourses} />
          <Route path="/gamer-raffle" component={GamerRaffle} />
          <Route path="/level/:levelId" component={LevelViewer} />
          {/* Kid Professor Routes */}
          {user && (user.role === 'kids_professor' || user.roleId === 7) && (
            <Switch>
              <Route path="/kids-teach" component={() => <KidsProfessorDashboard user={user} />} />
              <Route path="/kids-teach/module/:id">
                <KidsModuleEditor user={user!} />
              </Route>
              <Route path="/kids-teach/editor" component={() => <KidsCourseEditor user={user} />} />
              <Route path="/kids-teach/editor/:id" component={({ params }: { params: any }) => <KidsCourseEditor user={user} id={params ? Number(params.id) : undefined} />} />
              <Route>
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Panel de Control Kids</h1>
                    <p className="text-slate-500 mb-4">Cargando tu laboratorio musical...</p>
                    <Button onClick={() => setLocation('/kids-teach')}>Ir al Dashboard</Button>
                  </div>
                </div>
              </Route>
            </Switch>
          )}
        </Switch>
      </main>
      <Toaster />

      {/* --- GLOBAL SUSPENSION OVERLAY --- */}
      <AnimatePresence>
        {isSuspended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-lg"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />

              <div className="relative bg-slate-900/90 border border-red-500/30 rounded-[2.5rem] p-10 text-center space-y-8 shadow-[0_0_80px_rgba(239,68,68,0.15)]">
                {/* Icon */}
                <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/40 rounded-3xl flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-xl animate-pulse" />
                  <AlertTriangle className="w-10 h-10 text-red-400 relative z-10" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/70">Estado del Sistema</p>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    Plataforma <br />
                    <span className="text-red-400">Suspendida</span>
                  </h2>
                </div>

                {/* Message */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-left space-y-1">
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">
                    Su acceso ha sido <strong className="text-red-400">suspendido por falta de pago</strong>. Para regularizar su situación y recuperar el acceso, por favor comuníquese con el área de <strong className="text-white">Contabilidad</strong>.
                  </p>
                </div>

                {/* Contact CTA */}
                <div className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <PhoneCall className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className="text-sm font-bold text-slate-300">
                    Área de <span className="text-cyan-400">Contabilidad</span>
                  </p>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                  Muchas gracias por su atención
                </p>

                <button
                  onClick={handleLogout}
                  className="text-slate-600 text-xs hover:text-slate-400 transition-colors underline"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
