# TukShop deployment

## Active configuration

- GitHub repository: `woravi/tukshop-app`
- Deployment branch: `master`
- Platform: Hostinger Node.js Web App, GitHub integration
- Framework: Next.js
- Node.js: 22.x
- Root directory: `./`
- Build: `npm run build`
- Production domain: `tukshop.ratchavit.com`

A push to `master` triggers a new deployment of the existing production app without clicking Redeploy. This was verified for commit `e4baa5d`: Hostinger deployment `01a1902a-973e-72fd-887d-42b96bde4659` cloned that commit, built with Node 22, published, and restarted successfully. The production storefront and product API returned HTTP 200.

The app was already connected to GitHub even though its preceding deployment came from a ZIP upload. A latest ZIP deployment does not prove that automatic GitHub deployments are disconnected. No domain migration or replacement app is required.

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

The check uploads a tiny generated PNG and requires it to be readable immediately, without restarting the process. It deletes its own local test upload. On a remote test instance, the generated image remains in that instance's uploads directory. Local checks require byte-for-byte equality; remote checks compare the fixture's decoded pixel values because the hosting image CDN may re-encode PNG metadata and compression. Both local and production-domain checks passed.

## Demo limitations

This migration configures deployment, not production readiness. The current admin/API authorization, payment confirmation, stock validation, and upload-modal race still need separate work.

`src/data/db.json` is a tracked sample database and uploads are stored on the app filesystem. A fresh deployment can replace/reset these files. Do not store real customer data or irreplaceable images until persistent storage and backups are implemented and verified.
