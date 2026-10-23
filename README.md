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

The "Map your expansion" form is a [Netlify Form](https://docs.netlify.com/forms/setup/) named
`map-my-expansion`. Netlify detects it in the built HTML on each deploy, and submissions appear under
**Forms** in the Netlify dashboard (form detection must be enabled for the site). Bots are filtered with a
hidden honeypot field. Email notifications can be added in Netlify under **Forms → Form notifications**.

On hosts other than Netlify (such as the GitHub Pages build), set the repository variable `FORM_ENDPOINT`
under **Settings → Secrets and variables → Actions → Variables** to a form service URL (Formspree, Basin, …)
and the answers are POSTed there as JSON instead.
