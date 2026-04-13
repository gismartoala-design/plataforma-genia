# Progress Model

## Purpose

This document defines the business meaning of "progress" in the platform.

The goal is to stop mixing:

- visual class progress
- class completion for advancement
- class access / unlock state

These are different concepts and must remain separate in backend logic, API responses, and UI labels.

## Core Concepts

Each class / level must expose three independent states:

1. `progressPercent`
   What percentage of the class work the student has completed.

2. `completionStatus`
   Whether the class already counts as completed for advancement.

3. `accessStatus`
   Whether the student can currently enter the class.

## Canonical Fields

Every class / level response should eventually expose:

- `progressPercent: number`
- `completionStatus: "not_started" | "in_progress" | "completed"`
- `accessStatus: "locked_time" | "locked_sequence" | "locked_manual" | "unlocked"`
- `requiredActivities: string[]`
- `completedActivities: string[]`
- `optionalActivities?: string[]`
- `daysRequired?: number`
- `daysPassed?: number`

## Business Meaning

### `progressPercent`

Answers:
"How much of this class has the student done?"

Rules:

- Used for visual progress only.
- Must never unlock the next class by itself.
- Includes required and optional work.
- Should be safe to show in dashboards, cards, badges, and progress bars.

Examples:

- A specialization class with BD, IT, and PIC:
  - BD done, IT done, PIC pending
  - `progressPercent` may be `66`

- A standard class with RAG, HA, and PIM:
  - RAG done, HA pending, PIM pending
  - `progressPercent` may be `33`

### `completionStatus`

Answers:
"Does this class already count as completed for progression?"

Rules:

- This is the only field that should drive advancement to the next class.
- A class can be `completed` even if `progressPercent < 100`.
- A class can be `in_progress` even if `progressPercent` is high.

Values:

- `not_started`
  No relevant class work has been completed.

- `in_progress`
  Some class work has been completed, but required activities are still missing.

- `completed`
  All required activities for this class are complete.

### `accessStatus`

Answers:
"Can the student enter this class right now?"

Rules:

- Access is independent from visual progress.
- Access is controlled by time, sequence, and manual blocking.
- UI should use this field for lock / unlock behavior.

Values:

- `locked_time`
  The class is still waiting for the configured unlock timing.

- `locked_sequence`
  The previous class has not been completed yet.

- `locked_manual`
  The class was manually blocked by a professor.

- `unlocked`
  The student can access the class.

## Rules by Module Type

### Standard Modules

Required activities for advancement:

- `RAG`
- `HA`

Optional activities:

- `PIM`
- other non-required content

Completion rule:

- `completionStatus = completed` only when `RAG` and `HA` are complete.

### Specialization Modules

Required activities for advancement:

- `BD`
- `IT`

Optional activities:

- `PIC`
- other non-required content

Completion rule:

- `completionStatus = completed` only when `BD` and `IT` are complete.

## Example Scenarios

### Specialization Example A

Class contains:

- `BD`
- `IT`
- `PIC`

Student completed:

- `BD`
- `IT`

Student did not complete:

- `PIC`

Result:

- `progressPercent = 66`
- `completionStatus = completed`
- next class may unlock
- `PIC` remains optional pending work

### Specialization Example B

Student completed:

- `BD`

Student did not complete:

- `IT`
- `PIC`

Result:

- `progressPercent = 33`
- `completionStatus = in_progress`
- next class must remain locked by sequence

### Standard Example A

Student completed:

- `RAG`
- `HA`

Student did not complete:

- `PIM`

Result:

- `completionStatus = completed`
- next class may unlock
- `PIM` can remain pending without blocking advancement

## UI Language

UI should stop using one ambiguous label like "progress" for everything.

Preferred labels:

- "Class progress" for `progressPercent`
- "Class completed" for `completionStatus`
- "Class unlocked" or "Locked" for `accessStatus`

Avoid:

- Using `progressPercent` to decide advancement
- Showing one badge that tries to describe percent, completion, and access at the same time

## Compatibility with Current Fields

During migration, current fields may coexist with the new model.

Temporary equivalences:

- `porcentajeCompletado -> progressPercent`
- `completado -> completionStatus === "completed"`
- `isUnlocked -> accessStatus === "unlocked"`

Legacy flags like:

- `isUnlockedByTime`
- `isUnlockedByProgress`
- `isManuallyBlocked`

should be considered transitional implementation details, not the canonical contract.

## Implementation Principle

The system should have one shared calculation engine for class status.

Different module types may use different required activities, but the output contract must remain the same.

In other words:

- the rules may vary by module category
- the meaning of the output fields must not vary

## Acceptance Criteria

This model is considered correctly implemented when:

1. A class can have high `progressPercent` but still be `in_progress`, and that is expected.
2. The next class unlocks only through `completionStatus`.
3. Dashboard and class detail use the same semantic contract.
4. Standard and specialization flows can differ in required activities without changing field meaning.
5. UI labels clearly distinguish progress, completion, and access.
