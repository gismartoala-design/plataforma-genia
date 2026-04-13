import type {
  AccessStatus,
  CompletionStatus,
  LevelProgressSnapshot,
} from "../types/progress.types";

export function getCompletionStatus(
  progress?: LevelProgressSnapshot | null,
): CompletionStatus {
  if (progress?.completionStatus) {
    return progress.completionStatus;
  }

  if (progress?.completado) {
    return "completed";
  }

  if ((progress?.porcentajeCompletado ?? 0) > 0) {
    return "in_progress";
  }

  return "not_started";
}

export function getAccessStatus(
  progress?: LevelProgressSnapshot | null,
): AccessStatus {
  if (progress?.accessStatus) {
    return progress.accessStatus;
  }

  if (progress?.isManuallyBlocked) {
    return "locked_manual";
  }

  if (progress?.isUnlocked) {
    return "unlocked";
  }

  if (progress && progress.isUnlockedByTime === false) {
    return "locked_time";
  }

  if (progress && progress.isUnlockedByProgress === false) {
    return "locked_sequence";
  }

  return "locked_sequence";
}

export function isLevelCompleted(progress?: LevelProgressSnapshot | null) {
  return getCompletionStatus(progress) === "completed";
}

export function isLevelUnlocked(progress?: LevelProgressSnapshot | null) {
  return getAccessStatus(progress) === "unlocked";
}

export function getProgressPercent(progress?: LevelProgressSnapshot | null) {
  if (typeof progress?.progressPercent === "number") {
    return progress.progressPercent;
  }

  if (typeof progress?.porcentajeCompletado === "number") {
    return progress.porcentajeCompletado;
  }

  return 0;
}
