/**
 * Common Types
 * Tipos compartidos en toda la aplicación
 */

export type UserRole = 
  | "student" 
  | "admin" 
  | "professor" 
  | "superadmin" 
  | "kids" 
  | "kids_professor" 
  | "institutional_admin" 
  | "institutional_professor"
  | "profesor_vista"
  | "profesor_latam"
  | "estudiante_latam";

export interface User {
  id: string | number;
  name: string;
  role: UserRole;
  plan?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
