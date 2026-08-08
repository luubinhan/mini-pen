export function buildPreviewDocument(html: string, css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>${css}</style>
  </head>
  <body>${html}</body>
</html>`
}
