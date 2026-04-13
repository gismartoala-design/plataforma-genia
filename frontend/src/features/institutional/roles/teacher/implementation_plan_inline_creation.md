# Implementation Plan - Intuitive Level Creation

Improve the user experience for creating new levels in the Institutional Module Editor by replacing the browser prompt with a smooth, inline creation interface.

## Proposed Changes

### [Institutional Module Editor]

#### [MODIFY] [InstitutionalModuleEditor.tsx](file:///c:/Users/gtoal/OneDrive/Escritorio/arg-academy-fe/frontend/src/features/institutional/roles/teacher/InstitutionalModuleEditor.tsx)
-   Add state for `isInlineCreating` and `inlineLevelName`.
-   Implement a new UI component for the inline creation card in the sidebar.
-   Replace the `handleCreateLevel` logic to toggle this state instead of using `window.prompt`.
-   Handle `Enter` and `Escape` keys for confirming or canceling creation.

## Verification Plan

### Manual Verification
-   Click the "Crear Nivel" button and verify the inline input appears correctly.
-   Input a name and press Enter; verify the level is created and the Master Plan opens.
-   Press Escape and verify the input cancels correctly.
-   Verify that clicking "Otras Herramientas" still opens the classic toolbox.
