# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d52d527e-d039-4d27-8217-4784260ad798

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d52d527e-d039-4d27-8217-4784260ad798) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

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

## Mock System Migration Notice

⚠️ **IMPORTANT**: This project has been migrated from Mock Service Worker (MSW) to a simpler static JSON mock system for improved stability and development experience.

### Current Setup (Static Mocks)
- Mock data is served from static JSON files in `/public/mocks/`
- Automatically used in development mode (`npm run dev`)
- No service worker setup or initialization required
- More reliable and faster than MSW

### Files:
- `/public/mocks/health.json` - API health check response
- `/public/mocks/organizations.json` - Organizations data
- `/public/mocks/users.json` - Users data  
- `/public/mocks/chats.json` - Chat conversations data

### Re-enabling MSW (if needed)
If you need to restore MSW for dynamic mocking capabilities:
1. Restore MSW initialization code in `src/main.tsx`
2. Update `src/lib/config.ts` to include MSW-specific settings
3. Modify `src/lib/api-client.ts` to handle MSW endpoints
4. Install MSW dependency: `npm install msw@latest`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d52d527e-d039-4d27-8217-4784260ad798) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
