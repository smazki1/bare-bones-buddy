# Project Brief: Bare Bones Buddy

## Project Overview
A Hebrew RTL website for a food photography business that creates professional images for restaurants and businesses. The site includes admin panels for content management and a customer-facing website.

## Core Requirements
- **Language**: Hebrew (RTL) with proper BiDi text handling
- **Target Audience**: Restaurant and business owners needing professional food photography
- **Key Features**:
  - Homepage with hero section, business solutions, and visual solutions
  - Portfolio showcase
  - Services page
  - Contact page with simplified form
  - Admin panels for content management (solutions, visual solutions, markets)
  - WhatsApp integration for direct contact

## Business Goals
- Generate leads through contact forms and WhatsApp
- Showcase portfolio and capabilities
- Provide easy content management through admin panels
- Professional appearance with proper Hebrew typography

## Technical Stack
- React + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Shadcn/ui components
- Supabase (Postgres, Auth, Realtime, Edge Functions) for data, auth, and admin CRUD
- Local storage for config mirroring (fallback and fast loads)
- React Router for navigation

## Success Criteria
- All admin panels work correctly with realtime updates via Supabase
- Proper RTL text rendering throughout
- Mobile-responsive design
- Fast loading and smooth user experience
- Easy content management for business owners (solutions/visual solutions via `site_configs`)
