# Implementation Plan - Quests & Heroes

This plan outlines the steps to implement the brainstormed mechanics for Quests, Heroes, and the "Introspection" tutorial.

## User Review Required
> [!NOTE]
> **Data Strategy**: We will update the constants in the code. This will apply to all users (new and existing) for future actions. No data migration is required.

## Proposed Changes

### 1. Economy & Constants
**File:** [gameLogic.js](file:///src/logic/gameLogic.js)
-   **Update `BUILDING_COSTS`**:
    -   `tavern`: **100 Gold** (was 250).
    -   `house`: 100 Gold (unchanged).
-   **Cleanup**:
    -   Remove legacy `QUESTS` array (lines 17-21).
    -   Remove legacy `ENEMY_TYPES` if unused.
-   **Add Data Structures**:
    -   `QUEST_TEMPLATES`: The new full list of available quests (Introspection, Patrol, etc.).
    -   `INSPIRATION_HABITS`: The list of example habits for the tutorial.

### 2. State Management (Game Loop)
**File:** [useGame.js](file:///src/hooks/useGame.js) (or wherever `gameState` is initialized)
-   **New State Properties**:
    -   `quests`: Array of active/completed quest objects `{ id, templateId, heroIds, startTime, status }`.
    -   `heroes`: Ensure structure supports status (`IDLE`, `QUESTING`, `RECOVERING`).
-   **Logic Updates**:
    -   `recruitHero`: Check if it's the first hero (cost 0).

### 3. Quest Logic Engine
**File:** [gameLogic.js](file:///src/logic/gameLogic.js)
-   **New Functions**:
    -   `startQuest(gameState, questId, heroIds)`: Validates requirements, sets hero state, deducts resources.
    -   `completeQuest(gameState, questInstanceId)`: logic for "Instant" quests.
    -   `evaluateQuestOutcomes(gameState)`: (For daily/timed quests) Checked on day turnover.
    -   `checkQuestRequirements(quest, heroes)`: Verifies if selected heroes meet the difficulty.

### 4. UI - Tavern & Adventure
**File:** [TavernView.jsx](file:///src/components/views/TavernView.jsx)
-   **Scope**: **Hero Recruitment ONLY**.
-   **Changes**:
    -   Display current heroes in a "Lobby" or list.
    -   "Recruit New Hero" button (First one free, then costs Gold).

**File:** [AdventureView.jsx](file:///src/components/views/AdventureView.jsx)
-   **Scope**: **Quest Board**.
-   **Changes**:
    -   Replace "WIP" screen with `QuestBoard` component.
    -   List available quests from `QUEST_TEMPLATES`.
    -   **Quest Detail Modal**: Shows requirements, allows selecting heroes, "Start Quest" button.

### 5. UI - Tutorial & Inspiration
**File:** [OnboardingModal.jsx](file:///src/components/OnboardingModal.jsx) OR New Component
-   **Trigger**:
    -   This tutorial flow activates **only after Building the Tavern**.
    -   It might be a separate `TutorialModal` or a specific state in `AdventureView`.
-   **Integration**:
    -   Add "Quest 0" as the pinned first quest in the **Adventure Tab**.
    -   Clicking "Quest 0" opens the **Inspiration List**.

## Verification Plan

### Automated Tests
-   `gameLogic.test.js`:
    -   Test `startQuest` deducts energy/availability.
    -   Test `calculateBattleResult` (existing) adapted for new difficulty math.
    -   Test `INSPIRATION_HABITS` structure validity.

### Manual Verification
1.  **New Game Flow**:
    -   Reset Save.
    -   Verify Start Gold = 200.
    -   Buy House (100) + Tavern (25) -> Verify Balance.
    -   Enter Tavern -> Recruit Hero (0 Gold).
2.  **Quest 0**:
    -   Accept "Introspection".
    -   Open Inspiration List.
    -   Add 3 Habits.
    -   Verify Quest Complete -> Reward.
3.  **Instant Quest**:
    -   Accept "Organize Inventory" (Instant).
    -   Click "Complete" immediately.
    -   Verify Reward.
