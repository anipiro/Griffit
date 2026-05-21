**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Quick local setup (recommended)

- Prerequisites: Docker Desktop and Node.js + npm.
- Install the Supabase CLI once (used by the local emulator):

```bash
npm install -g supabase
```

- Install project deps and start local Supabase + dev server:

```bash
npm install
npm run dev:local
```

- This starts a local Supabase stack (via Docker) and the Vite dev server together. Data lives under `./supabase` and is for development only.

- If you prefer not to run the emulator, you can still copy `/.env.example` to `/.env` and provide values from your Supabase dashboard (advanced users).

