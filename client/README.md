
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

## Learn more

This README is a slimmed-down guide; for deeper Create React App docs see:
https://facebook.github.io/create-react-app/docs/getting-started

If you'd like, I can add environment examples, common troubleshooting steps, or CI/CD deployment notes.
