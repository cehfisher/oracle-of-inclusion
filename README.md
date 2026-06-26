# Oracle of Inclusion

Oracle of Inclusion is a Vite and React app that generates inclusive fireside-chat questions about accessibility, disability, inclusion, and technology.

## Features

- Guided question generation for accessibility and inclusion conversations
- Topic, focus area, audience, and tone controls
- Light/dark theme toggle with the initial theme matched to the user's OS setting
- Optional animations and sound effects
- Recent-question tracking to reduce duplicates

## Getting started

```bash
npm ci
npm run dev
```

## Available scripts

- `npm run dev` - start the local Vite development server
- `npm run build` - build the production app
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Deployment

The app is configured for GitHub Pages through `.github/workflows/deploy.yml`. Pushes to `main` build and deploy the `dist` output.
