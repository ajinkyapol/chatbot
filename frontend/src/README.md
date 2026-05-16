# Project Structure

This directory contains the source code for the chatbot application.

## Folder Structure

```
src/
├── api/              # API endpoints and HTTP client configurations
├── assets/           # Static assets (images, fonts, icons)
├── components/       # Reusable React components
│   ├── Header/      # Header section component
│   ├── InputBox/    # Input box and actions component
│   ├── MessagesArea/# Messages display component
│   └── Sidebar/     # Sidebar navigation component
├── config/          # Configuration files (environment, app settings)
├── constants/       # Application constants and enums
├── context/         # React Context providers (global state)
├── hooks/           # Custom React hooks
├── services/        # Business logic and service layers
├── store/           # State management (Redux, Zustand, etc.)
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── App.css          # Application-specific styles
├── App.jsx          # Main application component
├── index.css        # Global styles and CSS reset
└── main.jsx         # Application entry point
```

## Folder Purposes

### `api/`
API endpoints, axios/fetch configurations, and HTTP client setup.

### `assets/`
Static assets like images, fonts, and icons.

### `components/`
Reusable React components organized by feature/section.

### `config/`
Application configuration, environment variables, and settings.

### `constants/`
Constant values, enums, and configuration objects.

### `context/`
React Context providers for global state management.

### `hooks/`
Custom React hooks for reusable logic.

### `services/`
Business logic, data processing, and service layers.

### `store/`
Global state management (Redux, Zustand, Jotai, etc.).

### `types/`
TypeScript type definitions and interfaces.

### `utils/`
Utility functions, helpers, and common operations.
