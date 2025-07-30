# Components Structure

This document describes the organized component structure of the SmedBox frontend application.

## Directory Structure

```
src/components/
├── Auth/              # Authentication related components
│   ├── Login.jsx
│   ├── Register.jsx
│   └── index.js
├── Cards/             # Card/Box display components
│   ├── BoxControl.jsx
│   ├── BoxJadwal.jsx
│   └── index.js
├── Common/            # Common utility components
│   ├── AllSlotsFullWarning.jsx
│   ├── ErrorBoundary.jsx
│   └── index.js
├── Forms/             # Form and input components
│   ├── CompactInput.jsx
│   ├── CompactInputControl.jsx
│   ├── CompactSelect.jsx
│   ├── InputControlJadwal.jsx
│   ├── InputJadwalObat.jsx
│   └── index.js
├── Icons/             # SVG icon components
│   ├── BellIcon.jsx
│   ├── CalendarIcon.jsx
│   ├── ControlIcon.jsx
│   ├── HistoryIcon.jsx
│   ├── NoteIcon.jsx
│   ├── PlusIcon.jsx
│   ├── SearchIcon.jsx
│   ├── image.png
│   └── index.js
├── Layout/            # Layout and navigation components
│   ├── Layout.jsx
│   ├── NavbarLeft.jsx
│   ├── NavbarTop.jsx
│   └── index.js
├── UI/                # General UI components
│   ├── AddButton.jsx
│   ├── Breadcrumb.jsx
│   ├── EmptyState.jsx
│   ├── LoadingScreen.jsx
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   ├── StepIndicator.jsx
│   └── index.js
└── index.js           # Main export file
```

## Usage

### Individual Component Import

```javascript
import { Login } from "../components/Auth";
import { BoxControl } from "../components/Cards";
import { CompactInput } from "../components/Forms";
```

### Multiple Component Import

```javascript
import { Login, Register } from "../components/Auth";

import { Modal, LoadingSpinner, AddButton } from "../components/UI";
```

### All Components Import

```javascript
import { Login, BoxControl, CompactInput, Modal, Layout } from "../components";
```

## Component Categories

### Auth

Components related to user authentication and authorization.

### Cards

Display components that show data in card/box format.

### Common

Shared utility components used across the application.

### Forms

Form inputs, form containers, and form-related components.

### Icons

SVG icon components for consistent iconography.

### Layout

Components that define the application structure and navigation.

### UI

General user interface components like buttons, modals, spinners, etc.

## Benefits of This Structure

1. **Clear Organization**: Components are grouped by functionality
2. **Easy Maintenance**: Related components are in the same folder
3. **Scalable**: Easy to add new components to appropriate categories
4. **Reusable**: Components can be easily imported where needed
5. **Better Development**: Developers can quickly find components by category
