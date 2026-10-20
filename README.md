# Optegra Advisors website

Marketing site for Optegra Advisors, built from the **Home V5 · Charcoal-led** frame on Page 5 of the
[Optegra Advisors – Web](https://www.figma.com/design/ilDENtE9cUo35pd56NIg82/Optegra-Advisors---Web) Figma file.

Plain HTML, CSS and a little JavaScript, bundled with [Vite](https://vite.dev).

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Project layout

```
index.html            home page (all sections, inline US network map)
franchisors.html      For Franchisors: three profiles, roadmap, services
franchisees.html      For Franchisees: two profiles, roadmap, services
services.html         the four services in detail
insights.html         market signals, field guides and FAQ
contact.html          ways to start, the form, next steps and the office
partials/             shared navigation, footer and contact form, pulled into
                      each page with <!-- @include name --> (see vite.config.js)
src/style.css         home page styles, design tokens and responsive breakpoints
src/pages.css         components used by the inner pages
src/main.js           mobile menu, scroll reveal, profile tabs and the form
public/images/        logo, brand logos, photos, page heroes, team portraits, icons
.github/workflows/    GitHub Pages deployment
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages through
`.github/workflows/deploy.yml`. In the repository settings, **Settings → Pages → Build and deployment → Source**
must be set to **GitHub Actions** (one-time step).

## Contact form

The "Map your expansion" form works without a backend: it opens the visitor's email app with their answers.
To change that, add repository variables under **Settings → Secrets and variables → Actions → Variables**:

| Variable        | Effect                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| `CONTACT_EMAIL` | Address the email is sent to (for example `hello@optegra-advisors.info`) |
| `FORM_ENDPOINT` | A form service URL (Formspree, Basin, …); answers are POSTed as JSON     |

Re-run the deploy workflow after changing them.
