# ADR 0002: Phase 1 Implementation - Visual Foundation & Tablature Rendering

## Status
Proposed

## Context
Phase 1 focuses entirely on establishing the visual foundation of the application. The primary challenge is configuring a stable, client-side rendering engine for music notation and tablature (`alphaTab`) within a React and TypeScript lifecycle, and managing initial application state (such as song or exercise selection) using `Zustand`.

At this stage, there is no real-time audio playback or microphone analysis. The UI must be static, performant, and correctly map standard musical pitches to a 4-string bass guitar layout (standard tuning: E, A, D, G).

## Decision
We will implement a clean, single-page interface centered around an `alphaTab` viewport, backed by an isolated Zustand state store for UI configuration.

### 1. File & Component Structure
We will establish a modular component hierarchy under `src/`:
* `components/AppLayout.tsx`: The main container handling the grid layout.
* `components/TrackSelector.tsx`: A simple sidebar or dropdown to switch between the hard-coded walking bass lines.
* `components/NotationViewer.tsx`: The wrapper component that handles the direct DOM injection and lifecycle management of the `alphaTab` canvas.
* `store/useUiStore.ts`: The initial Zustand store managing UI states.

### 2. State Management Design (`useUiStore`)
To prevent unnecessary re-renders of the notation canvas, the Zustand store will hold minimal, high-level primitive states:
* `currentTrackId`: string (ID of the active hard-coded bass line).
* `isNotationLoading`: boolean (tracks alphaTab initialization state).
* *Action*: `setCurrentTrackId(id: string)`

### 3. alphaTab Integration Strategy
Because `alphaTab` manipulates the DOM directly via a canvas/SVG wrapper, it must be carefully isolated from React's virtual DOM updates to avoid duplicate renderings.
* **DOM Anchor:** We will use a standard HTML element container with a stable React `useRef`.
* **Initialization:** The `alphaTab` api instance will be initialized inside a `useEffect` hook with an empty dependency array `[]` to ensure it instantiates exactly once when the component mounts.
* **Data Injection:** Hard-coded walking bass lines will be written in **AlphaTex** format—a lightweight text-based music notation format native to alphaTab—making it easy to store as strings in a local configuration array without loading heavy external files.

### 4. Phase 1 Hard-Coded Tracks
We will define a static data file `src/data/sampleLines.ts` containing at least two basic 12-bar blues or ii-V-I walking bass progressions written in AlphaTex format:
* Track 1: G Major ii-V-I progression (Quarter notes only).
* Track 2: C Minimal 12-Bar Blues baseline (Quarter notes only).

---

## Technical Specifications & Code Patterns

### Baseline AlphaTex Implementation Example
For a 4-string bass track in standard tuning, the configuration string within our data layer will be structured as follows:

```text
\title "G Major Walking Baseline"
\subtitle "Phase 1 Testing"
\clef bass
\tuning bass-4-standard
\tempo 120
.
:4 g0 a2 b1 c2 | d0 e2 f#1 g2
```

### React Component Lifecycle for alphaTab
The core implementation pattern inside `NotationViewer.tsx` will utilize the following structure:

```tsx
import React, { useEffect, useRef } from 'react';
import { AlphaTabApi } from '@coderline/alphatab';

type NotationViewerProps = {
  texSource: string;
};

export function NotationViewer({ texSource }: NotationViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabApi | null>(null);

  useEffect(() => {
    if (containerRef.current && !apiRef.current) {
      // Initialize alphaTab exactly once
      apiRef.current = new AlphaTabApi(containerRef.current, {
        core: {
          engine: 'canvas',
          tracks: [0] // Only render the primary bass track
        }
      });
    }

    // Update the score whenever the source track changes
    if (apiRef.current && texSource) {
      apiRef.current.tex(texSource);
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.destroy();
        apiRef.current = null;
      }
    };
  }, [texSource]);

  return <div ref={containerRef} />;
}
```

---

## Consequences

### Positive
* **Decoupled Lifecycle:** Isolating the raw canvas manipulation inside a single `useEffect` ensures that UI adjustments in other parts of the app do not trigger heavy recalculations or visual flickering in the music notation.
* **No File Overhead:** Storing tracks as text-based AlphaTex strings eliminates the need to bundle, host, or asynchronously fetch `.gp` (Guitar Pro) binary files during early development phases.

### Negative / Risks
* **alphaTab Component Cleanup:** If the component unmounts quickly or switches tracks before the previous layout engine finishes computing, it can throw minor async exceptions. We mitigate this by holding a persistent mutable instance reference via `apiRef.current` and explicitly calling `.destroy()` on unmount.