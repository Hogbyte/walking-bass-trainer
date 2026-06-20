# ADR 0001: Overall Architecture and Phased Implementation Plan

## Status
Proposed

## Context
We are building a purely client-side React application to help users learn and practice walking bass lines. The system must evolve from a static visual aid (displaying standard notation and bass tablature) into a highly interactive tool that processes real-time audio via the user's microphone, detects pitch, and provides performance feedback.

Because all processing happens in the browser, the architecture must efficiently handle the Web Audio API for both playback and microphone input, ensuring low latency and preventing the React render cycle from interfering with audio timing.

Furthermore, this project leverages a completely local, AI-native development workflow. The local Language Model configuration forms a core part of the engineering toolchain and must be treated as an architectural component of the development lifecycle to optimize code generation, problem-solving, and implementation speed.

## Decision
We will adopt a phased implementation strategy, strictly separating the UI/rendering logic from the audio processing engine, and establish a dedicated local AI copilot stack.

### Core Technology Stack
* **UI Framework:** React (bootstrapped via Vite for optimal build performance).
* **Notation/Tablature Rendering:** `alphaTab`. This is chosen over VexFlow because it is tailor-made for guitar and bass tablature, automatically handles alignment between standard notation and tabs, and natively supports Guitar Pro file parsing.
* **State Management:** `Zustand`. This allows us to handle fast-moving audio playback and real-time pitch data completely outside the standard React render cycle, updating the DOM only when specific thresholds or note-changes occur to maintain high performance.
* **Audio Playback & Processing:** The native browser Web Audio API. 
* **Pitch Detection:** `pitchfinder`. We will utilize its built-in JavaScript pitch estimation algorithms (such as YIN or AMDF) to analyze incoming microphone streams without the initial complexity of building a custom WebAssembly module.

### Development Toolchain (Local AI Stack)
To assist with rapid prototyping, architectural implementation, and debugging, the development environment will be paired with a local LLM server configured as follows:
* **Primary Copilot Model:** `Qwen2.5-Coder-14B-Instruct` running at 8-bit quantization (Q8). This fits fully within the 16 GB GPU VRAM to ensure instantaneous token generation for routine coding tasks and rapid code completions.
* **Secondary Reasoning Model:** `Qwen2.5-Coder-32B-Instruct` running at 4-bit quantization (Q4_K_M). This will be spun up to tackle complex architectural refactors, Web Audio API timing issues, or advanced mathematical logic for procedural generation, utilizing unified memory/system RAM fallback where necessary.

---

### Phased Roadmap

Phase 1: Visual Foundation (Static UI)
   │
   ▼
Phase 2: Audio Playback Engine (Playhead Sync)
   │
   ▼
Phase 3: Interactive Pitch Detection (Mic Input)
   │
   ▼
Phase 4: Telemetry & Performance Metrics
   │
   ▼
Phase 5: Complexity & Procedural Generation

#### Phase 1: Visual Foundation (Static UI)
* Implement the core UI layout and component structure.
* Integrate `alphaTab` to render hard-coded, quarter-note walking bass lines.
* Ensure accurate mapping between standard notation and bass-specific tablature.

#### Phase 2: Audio Playback Engine
* Implement Web Audio API integration for synthesizing or playing sampled bass tones.
* Build a synchronization engine (a visual playhead) that highlights the active note on the tablature in real-time during playback.

#### Phase 3: Interactive Pitch Detection
* Implement microphone permission handlers and stream capture.
* Route microphone input through an `AnalyserNode` and apply `pitchfinder` algorithms.
* Calibrate detection for the specific low-frequency range of a bass guitar (standard tuning: E1 at ~41.2 Hz to G4 at ~392 Hz).
* Modify the UI state to advance the playhead to the next note *only* when the detected pitch matches the expected target note.

#### Phase 4: Telemetry and Performance Metrics
* Introduce a scoring system to evaluate user performance.
* Track metrics such as timing accuracy (rhythmic variance), incorrect notes played, and time-to-completion.
* Persist session data locally using `IndexedDB`.

#### Phase 5: Complexity and Procedural Generation
* Expand the rendering and playback engine to support eighth notes, triplets, rests, and syncopation.
* Introduce a procedural generation engine that mathematically constructs walking bass lines over given chord progressions (e.g., standard ii-V-I jazz turnarounds) based on voice-leading rules.

---

## Consequences

### Positive
* **Zero Backend Infrastructure:** A strictly client-side architecture means no server-side audio processing, eliminating hosting costs and network latency during practice.
* **Iterative De-risking:** The phased approach allows us to solve standard React UI challenges first before tackling the timing and cross-browser quirks of the Web Audio API.
* **High-Performance Development:** Tailoring the local LLM stack to available hardware limits context-switching and ensures a high-quality coding assistant is always available offline.

### Negative / Risks
* **Low-Frequency Pitch Detection:** Detecting the fundamental frequency of a low E string (~41 Hz) quickly and accurately in JavaScript can be difficult and prone to latency. We may need to implement digital low-pass filtering to isolate the fundamental frequency from harmonic overtones before passing it to `pitchfinder`.
* **Browser Security Policies:** Browsers require explicit user interaction (a click or tap) before an `AudioContext` can be started or microphone permissions requested. The UX flow must gracefully account for this constraint starting in Phase 2.