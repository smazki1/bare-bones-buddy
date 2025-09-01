# Technical Context

## Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Development Setup
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Key Dependencies
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `react-router-dom`: ^6.8.1
- `framer-motion`: ^10.16.4
- `tailwindcss`: ^3.3.0
- `@radix-ui/*`: Various UI primitives
- `lucide-react`: ^0.263.1

## Build Configuration
- **Vite**: Modern build tool with HMR
- **TypeScript**: Strict mode enabled
- **Tailwind**: Custom configuration for RTL support
- **PostCSS**: For CSS processing

## File Structure
- `src/components/`: Reusable components
- `src/pages/`: Route components
- `src/data/`: Data stores and persistence
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions
- `src/types/`: TypeScript definitions

## Deployment
- Static site generation
- Build output in `dist/` directory
- Can be deployed to any static hosting service

## Browser Support
- Modern browsers with ES6+ support
- RTL text rendering support
- File upload API support
