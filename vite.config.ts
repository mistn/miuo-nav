import path from "path"
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

function webdavProxy(): Plugin {
  return {
    name: "webdav-proxy",
    configureServer(server) {
      server.middlewares.use("/api/webdav", async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk);
        const { url, method, body, auth } = JSON.parse(Buffer.concat(chunks).toString());
        try {
          const resp = await fetch(url, {
            method: method || "GET",
            headers: { Authorization: auth || "", "Content-Type": "application/octet-stream" },
            body: body || undefined,
          });
          res.statusCode = resp.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ status: resp.status, body: await resp.text() }));
        } catch (e) {
          res.statusCode = 502;
          res.end(JSON.stringify({ status: 502, body: String(e) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), webdavProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/amap": {
        target: "https://restapi.amap.com/v3",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/amap/, ""),
      },
    },
  },
})
