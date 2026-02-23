# GEMINI.md

## Project Overview
**pub-sub-vue** is a modern Vue 3 application built with Vite, designed to simulate and visualize document approval workflows using an event-driven "Pub/Sub" architecture (inspired by Redis Streams).

### Main Technologies
- **Framework:** [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Build Tool:** [Vite](https://vite.dev/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Routing:** [Vue Router](https://router.vuejs.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) (using `@tailwindcss/vite` plugin)
- **Networking:** [Axios](https://axios-http.com/)
- **Linting & Formatting:** [ESLint](https://eslint.org/), [Oxlint](https://oxlint.rs/), and [Prettier](https://prettier.io/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit) and [Playwright](https://playwright.dev/) (E2E)

### Architecture & Key Components
- **`src/stores/workflow.ts`**: The central Pinia store managing the event stream (`logs`) and processing state.
- **`src/views/HomeView.vue`**: The main interface for simulating document actions (Submit, Approve). Includes a "Mock Mode" for local-only testing without a backend.
- **`src/router/index.ts`**: Handles client-side navigation.
- **`src/assets/main.css`**: Global styles and Tailwind imports.

---

## Building and Running

### Prerequisites
- Node.js (v20.19.0+ or v22.12.0+)
- npm (installed with Node.js)

### Core Commands
| Action | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Development Mode** | `npm run dev` |
| **Build for Production** | `npm run build` |
| **Preview Production Build** | `npm run preview` |
| **Run Unit Tests** | `npm run test:unit` |
| **Run E2E Tests** | `npm run test:e2e` |
| **Lint (ESLint & Oxlint)** | `npm run lint` |
| **Format (Prettier)** | `npm run format` |
| **Type Check** | `npm run type-check` |

---

## Development Conventions

### Coding Style
- **TypeScript:** Strict typing is enforced. Use Interfaces/Types for data structures (e.g., `WorkflowEvent` in `workflow.ts`).
- **Component Structure:** Prefer `<script setup lang="ts">` for all Vue components.
- **Path Aliases:** Use `@/` to reference the `src/` directory (configured in `vite.config.ts` and `tsconfig.app.json`).
- **State Management:** Keep business logic and shared state in Pinia stores.

### Linting & Quality
- **Oxlint:** Used for fast linting before ESLint.
- **ESLint:** Configured with Vue and TypeScript rules.
- **Prettier:** Handles all code formatting. Always run `npm run format` before committing.

### Testing Practices
- **Unit Tests:** Located in `__tests__` directories near the components they test (e.g., `src/components/__tests__/`).
- **E2E Tests:** Located in the `e2e/` directory, using Playwright.
- **Verification:** Always ensure `npm run type-check` passes before considering a feature complete.

### Styling
- **Tailwind CSS 4:** Use utility classes directly in templates. Custom styles should be minimal and located in `src/assets/main.css`.
- **Responsive Design:** Mobile-first approach using Tailwind's responsive prefixes.
