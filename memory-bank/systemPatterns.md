# System Patterns

## Architecture Overview
The application follows a component-based React architecture with clear separation between admin and customer-facing features.

## Key Patterns

### State Management
- **Local Storage**: Admin data persisted in localStorage via custom stores
- **Event-Driven Updates**: Custom events for real-time sync between admin and frontend
- **React State**: Component-level state for forms and UI interactions

### Data Flow
```
Admin Panel → Local Storage → Custom Event → Frontend Components
```

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── ui/             # Shadcn/ui components
│   └── [feature]/      # Feature-specific components
├── pages/              # Route components
├── data/               # Data stores and persistence
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Admin Panel Pattern
- Each admin section has: Editor, List, and main page
- Real-time updates via custom events
- File upload with validation
- Drag-and-drop reordering

### RTL Support Pattern
- All text containers use `dir="rtl"`
- BiDi punctuation handled with `unicode-bidi: isolate-override`
- Proper Hebrew typography throughout

### Navigation Pattern
- Theme prop for background adaptation
- Responsive mobile menu
- Active link highlighting
- Logo as homepage link

### Form Pattern
- Simplified contact forms
- WhatsApp integration for submissions
- Validation and error handling
- Success state management
