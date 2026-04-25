# Green Track Frontend

Green Track is a Vite + React single-page application using TanStack Router file-based routing.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle locally.

## Output

The app now builds as a classic Vite SPA:

- HTML entry: `dist/index.html`
- Hashed assets: `dist/assets/*`
- Public assets: copied directly into `dist/`

When hosting the app, client-side routes such as `/login` need SPA fallback to `index.html`.

## Docker

The Docker image builds the app with Vite and serves the static output with nginx on port `3000`.
