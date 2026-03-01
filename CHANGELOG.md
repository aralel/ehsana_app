# Changelog

## Unreleased
- Fixed avatar edit button in Settings by wiring file picker and updating user avatar state.
- Added custom domain CNAME (`app.ehsana.com`) for GitHub Pages deployment.
- Added GitHub Actions workflow to build and deploy the site to GitHub Pages on every push to `main`.
- Set Vite base to `./` so built assets load when opening `dist/index.html` locally and under the custom domain.
