const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const outPath = path.join(distDir, 'index.single.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found — run `npm run build` first');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// inline CSS <link rel="stylesheet" href="...">
html = html.replace(/<link[^>]+href="([^"]+)"[^>]*>/g, (m, href) => {
  const p = href.replace(/^\//, '');
  const assetPath = path.join(distDir, p);
  if (fs.existsSync(assetPath)) {
    const css = fs.readFileSync(assetPath, 'utf8');
    return `<style>\n${css}\n</style>`;
  }
  return m;
});

// inline JS <script type="module" src="..."></script> and <script src="..."></script>
html = html.replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (m, attrs1, src, attrs2) => {
  const p = src.replace(/^\//, '');
  const assetPath = path.join(distDir, p);
  if (fs.existsSync(assetPath)) {
    const js = fs.readFileSync(assetPath, 'utf8');
    const typeModule = /type="module"/.test(attrs1 + attrs2) ? 'type="module"' : '';
    return `<script ${typeModule}>\n${js}\n</script>`;
  }
  return m;
});

fs.writeFileSync(outPath, html, 'utf8');
console.log('Wrote single-file HTML to', outPath);
