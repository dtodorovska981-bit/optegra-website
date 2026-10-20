import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = ['index', 'franchisors', 'franchisees', 'services', 'insights', 'contact'];

// Shared markup (navigation, footer, contact form) lives in partials/ and is
// pulled into each page with <!-- @include name -->. The link for the page
// being rendered is marked aria-current so the nav shows where you are.
function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = basename(ctx.filename, '.html');
        return html
          .replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
            readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8'),
          )
          .replace(new RegExp(`data-nav="${page}"`, 'g'), `data-nav="${page}" aria-current="page"`);
      },
    },
  };
}

// GitHub Pages serves project sites from /<repo>/, so the build uses relative
// asset paths and works at any base URL (including a custom domain).
export default defineConfig({
  base: './',
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, resolve(root, `${page}.html`)])),
    },
  },
});
