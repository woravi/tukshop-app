# TukShop deployment

## Target configuration

- GitHub repository: `woravi/tukshop-app`
- Deployment branch: `master`
- Platform: Hostinger Node.js Web App, GitHub integration
- Framework: Next.js
- Node.js: 22.x
- Root directory: `./`
- Build: `npm run build`
- Production domain: `tukshop.ratchavit.com`

A push to the branch connected in Hostinger must produce a new deployment without a manual redeploy. Confirm the deployed commit and successful build in hPanel after changing the integration. Initial migration is tested on a temporary domain before moving the production domain.

## Before pushing

```sh
node --test tests/*.test.mjs
npm run build
git diff --check
```

Use Node 22 locally to match the configured hosting runtime. Do not commit `.env.local`, environment import files, build output, `node_modules`, AppleDouble `._*` metadata, or runtime uploads.

Hostinger environment variables must include `NEXTAUTH_URL` for the active domain and a securely generated `NEXTAUTH_SECRET`. Keep values in the hosting environment, not in Git. LINE and Google login require separate provider credentials and callback configuration; they are not set up by connecting GitHub.

## Production-mode upload check

Start a production server after building. On an authorized disposable test instance, run:

```sh
TUKSHOP_SMOKE_BASE_URL=http://127.0.0.1:3218 node --test tests/production-upload-smoke.mjs
```

The check uploads a tiny generated PNG and requires it to be readable immediately, without restarting the process. It deletes its own local test upload. On a remote test instance, the generated image remains in that instance's uploads directory.

## Demo limitations

This migration configures deployment, not production readiness. The current admin/API authorization, payment confirmation, stock validation, and upload-modal race still need separate work.

`src/data/db.json` is a tracked sample database and uploads are stored on the app filesystem. A fresh deployment can replace/reset these files. Do not store real customer data or irreplaceable images until persistent storage and backups are implemented and verified.
