export type ActivityCode =
  | "RAG"
  | "HA"
  | "PIM"
  | "BD"
  | "IT"
  | "PIC"
  | "TRADITIONAL"
  | (string & {});

export type CompletionStatus = "not_started" | "in_progress" | "completed";

export type AccessStatus =
  | "locked_time"
  | "locked_sequence"
  | "locked_manual"
  | "unlocked";

export interface LegacyLevelProgressFlags {
  porcentajeCompletado?: number;
  completado?: boolean;
  isUnlocked?: boolean;
  isUnlockedByTime?: boolean;
  isUnlockedByProgress?: boolean;
  isManuallyBlocked?: boolean;
}

export interface LevelProgressSnapshot extends LegacyLevelProgressFlags {
  id: number;
  moduloId?: number;
  orden?: number;
  tituloNivel?: string;
  descripcion?: string;
  tipoActividad?: ActivityCode;
  progressPercent?: number;
  completionStatus?: CompletionStatus;
  accessStatus?: AccessStatus;
  requiredActivities?: ActivityCode[];
  completedActivities?: ActivityCode[];
  optionalActivities?: ActivityCode[];
  daysRequired?: number;
  daysPassed?: number;
}
