@AGENTS.md
# About This Project
Internal Management Dashboard (PMS & POS) for a nature resort.
Tech Stack: Next.js (App Router), React, Tailwind CSS, TypeScript, Supabase.

# Architecture & File Structure
- `src/lib/types.ts`: Core database schema & TypeScript interfaces. (ALWAYS check this first for data structures).
- `src/app/`: Next.js pages and routing.
- `src/components/`: Reusable UI components.

# Commands
- Dev Server: `npm run dev`
- Build: `npm run build`
- Install: `npm install`

# Coding Guidelines & Skills
- **TypeScript:** Strict typing. Avoid using `any`. Always use interfaces from `src/lib/types.ts`.
- **UI/UX:** Minimalist, earth-tone design (sage green, wood, charcoal). Use Tailwind CSS for all styling.
- **Language:** UI elements should support i18n (Thai/English).
- **Efficiency:** Do not rewrite existing functions if they can be imported. Keep components small and modular.
- **Rules:** When modifying the database or adding features, ensure it aligns with Thai operations (e.g., PromptPay support).