<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======

# Client (React) — Getting started

This folder contains the React front-end bootstrapped with Create React App.

## Available scripts

From the `client/` directory:

1. Install dependencies

	npm install

2. Start the dev server

	npm start

	This runs the app in development mode at http://localhost:3000.

3. Build for production

	npm run build

	Output is written to the `build/` folder and ready for deployment.

4. Run tests

	npm test

## Environment / API base URL

The client expects an API backend. By default the example server runs on port 5000. You can point the client to the API by setting the environment variable:

  REACT_APP_API_URL=http://localhost:5000

Create a `.env` file in `client/` (or set the variable in your shell) to override the API base URL used by the app.

## Notes & Troubleshooting

- If you change the API URL in `.env`, restart the dev server to pick up the change.
- If the client cannot reach the API, confirm the server is running (see `server/index.js`).
- For production deployment, ensure the client is built (`npm run build`) and served by a static server or via the backend.




>>>>>>> 2d192ccc0e8d530d443d37b6fda26af16fd3626d
