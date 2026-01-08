# Frontend Admin Dashboard

React Admin dashboard built with Vite and React Admin.

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** - UI library
- **React Admin** - Admin framework
- **Vitest** - Testing framework

## Available Scripts

### `yarn dev`

Runs the app in development mode.
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload automatically when you make edits.

### `yarn build`

Builds the app for production to the `build` folder.
The build is optimized and minified for the best performance.

### `yarn preview`

Preview the production build locally.

### `yarn test`

Run tests with Vitest.

### `yarn lint`

Run ESLint to check code quality.

### `yarn lint:fix`

Run ESLint and automatically fix issues.

### `yarn format`

Format code with Prettier.

## Development

The frontend runs on port 3001 and proxies API requests to the backend (port 3000).

## Project Structure

```
frontend/
├── src/
│   ├── pages/          # React Admin pages
│   ├── utils/          # Utility functions
│   ├── components/     # Reusable components
│   └── validates/      # Validation functions
├── public/             # Static assets
├── vite.config.js     # Vite configuration
└── eslint.config.js    # ESLint configuration
```
