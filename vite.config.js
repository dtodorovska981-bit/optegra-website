import { defineConfig } from 'vite';

// GitHub Pages serves project sites from /<repo>/, so the build uses relative
// asset paths and works at any base URL (including a custom domain).
export default defineConfig({
  base: './',
});
