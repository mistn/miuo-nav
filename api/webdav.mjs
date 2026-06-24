import https from "https";
import { URL } from "url";

function request(urlStr, method, headers, body, redirects = 5) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const opts = {
      hostname: u.hostname, port: u.port || 443, path: u.pathname + u.search,
      method, headers: { ...headers, Host: u.hostname },
      rejectUnauthorized: true,
    };
    const req = https.request(opts, (res) => {
      if (redirects > 0 && res.statusCode >= 301 && res.statusCode <= 308 && res.headers.location) {
        const loc = new URL(res.headers.location, urlStr).toString();
        return resolve(request(loc, method, headers, body, redirects - 1));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on("error", reject);
    if (body && (method === "PUT" || method === "POST" || method === "MKCOL" || method === "PATCH")) req.write(body);
    req.end();
  });
}

export default async function handler(req, res) {
  const { url, method, body, auth } = req.body;
  const up = (method || "GET").toUpperCase();
  const headers = { Authorization: auth || "" };
  if (up !== "GET" && up !== "HEAD") headers["Content-Type"] = "application/octet-stream";

  try {
    let resp = await request(url, up, headers, body || undefined);
    if (up === "PUT" && (resp.status === 404 || resp.status === 409)) {
      const parts = url.replace(/\/+$/, "").split("/");
      parts.pop();
      const parentUrl = parts.join("/");
      const mk = await request(parentUrl, "MKCOL", { Authorization: auth || "" }, null);
      if (mk.status < 400 || mk.status === 405) resp = await request(url, up, headers, body || undefined);
    }
    res.status(200).json({ status: resp.status, body: resp.body });
  } catch (e) {
    res.status(502).json({ status: 502, body: String(e) });
  }
}
