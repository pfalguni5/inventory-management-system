# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a React frontend bootstrapped with Create React App (CRA).
- All source code is in the `src/` directory. Entry point: `src/index.js`. Main app logic: `src/App.js`.
- Static assets and the main HTML template are in `public/`.
- The project uses standard CRA scripts for development, testing, and production builds.

## Developer Workflows
- **Start development server:** `npm start` (runs on http://localhost:3000)
- **Run tests:** `npm test` (Jest + React Testing Library, watch mode)
- **Build for production:** `npm run build` (outputs to `build/`)
- **Eject for full config control:** `npm run eject` (irreversible, copies all configs)

## Key Conventions & Patterns
- Use functional React components (see `App.js`).
- CSS is colocated per component (e.g., `App.css` for `App.js`).
- Testing uses React Testing Library (`App.test.js`).
- No custom routing, state management, or API integration is present by default—add as needed.
- No backend or API integration is included in this repo.

## External Dependencies
- Core: `react`, `react-dom`, `react-scripts`
- Testing: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@testing-library/dom`
- No additional libraries or frameworks are used by default.

## Project Structure
- `src/` — React components, entry point, styles, and tests
- `public/` — Static assets and HTML
- `package.json` — Scripts, dependencies, and config
- `README.md` — Standard CRA usage and troubleshooting

## Examples
- To add a new component: create `Component.js` and optional `Component.css` in `src/`, then import and use in `App.js`.
- To add a test: create `Component.test.js` in `src/`.

## References
- [Create React App Docs](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Docs](https://reactjs.org/)

---
If you add new conventions or workflows, update this file to keep AI agents productive.
