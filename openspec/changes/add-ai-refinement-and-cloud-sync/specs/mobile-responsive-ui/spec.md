## ADDED Requirements

### Requirement: 360px viewport floor

The system MUST render correctly and be fully usable at a viewport width of 360 CSS pixels in portrait orientation. No horizontal scroll MUST be required to access any control or content at that viewport size.

#### Scenario: User views the app at 360px wide

- **WHEN** the viewport is exactly 360 CSS pixels wide
- **THEN** all six Gibbs-stage textareas, the metadata fields, the AI affordances, and the save action are visible without horizontal scroll

### Requirement: Single-column layout on mobile viewports

The system MUST use a single-column layout for all viewport widths up to at least 768 CSS pixels. Multi-column layouts MAY be introduced at wider viewports.

#### Scenario: Phone-sized viewport

- **WHEN** the viewport is between 360px and 768px wide
- **THEN** all stage fields, metadata fields, and actions are arranged in a single vertical column

### Requirement: Tap target size

All interactive elements (buttons, AI affordances, links, navigation tabs) MUST have a minimum hit area of 44 × 44 CSS pixels.

#### Scenario: User taps an AI affordance with their thumb

- **WHEN** the user taps anywhere within the visual bounds of the "Sharpen" button
- **THEN** the tap registers reliably without requiring precision pointing

### Requirement: 16px minimum input font size

All `<input>` and `<textarea>` elements MUST have a font-size of at least 16 CSS pixels at all viewport widths.

#### Scenario: User taps a textarea on iOS Safari

- **WHEN** the user taps any reflection textarea
- **THEN** the page does not auto-zoom on focus

### Requirement: Sticky save action

The save action MUST remain reachable at the bottom of the viewport while the user is editing. The save action MUST respect the device's safe-area inset (e.g., `env(safe-area-inset-bottom)`).

#### Scenario: User scrolls through the form on a phone

- **WHEN** the user scrolls past the metadata fields and is editing the Description textarea
- **THEN** the save action is visible at the bottom of the viewport without further scrolling

#### Scenario: Device has a bottom safe-area inset

- **WHEN** the user is on a device with a bottom inset (notch, home indicator)
- **THEN** the save action sits above the inset and is not occluded by system UI

### Requirement: Per-stage AI affordance placement

The AI "Sharpen" affordance for each Gibbs stage MUST appear directly beneath that stage's textarea, in the document flow (not in a floating toolbar), so it scrolls with the stage.

#### Scenario: User edits a stage and looks for the affordance

- **WHEN** the user finishes typing in a textarea
- **THEN** the AI affordance for that stage is the next interactive element visible below the textarea

### Requirement: Dark mode support

The system MUST honor the user's `prefers-color-scheme` preference. A `dark` preference MUST result in a dark color palette across all surfaces.

#### Scenario: User has system-wide dark mode enabled

- **WHEN** the user opens the app on a device with `prefers-color-scheme: dark`
- **THEN** the page renders in a dark palette without requiring user action

### Requirement: Reduced motion support

The system MUST honor the user's `prefers-reduced-motion` preference. When set to `reduce`, transitions and animations MUST be disabled or shortened to under 50ms.

#### Scenario: User has reduced motion enabled

- **WHEN** the user opens the app with `prefers-reduced-motion: reduce`
- **THEN** any micro-animations (fade-ins, button pulses) are disabled or near-instantaneous

### Requirement: Test matrix

The system MUST be manually verified before each release on (a) Samsung Internet on a recent S-series Samsung, (b) Chrome on Android, (c) iOS Safari, (d) Chrome on desktop, and (e) Firefox on desktop.

#### Scenario: Pre-release QA pass

- **WHEN** a release is being prepared
- **THEN** a QA pass on each of the five environments is recorded as completed before merge to `main`
