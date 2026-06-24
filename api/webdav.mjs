import https from "https";
import { URL } from "url";
import { createClient } from "webdav";

function getAuthUserPass(auth) {
  if (!auth || !auth.startsWith("Basic ")) return { username: "", password: "" };
  const decoded = Buffer.from(auth.slice(6), "base64").toString();
  const idx = decoded.indexOf(":");
  return { username: decoded.slice(0, idx), password: decoded.slice(idx + 1) };
}

function httpsRequest(urlStr, method, headers, body, redirects = 5) {
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
        res.resume();
        return resolve(httpsRequest(loc, method, headers, body, redirects - 1));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

export default async function handler(req, res) {
  const { server: srv, method, path: pth, body, auth, url } = req.body;
  const { username, password } = getAuthUserPass(auth);

  if (!username || !password) {
    return res.status(200).json({ status: 401, body: "Missing or invalid credentials" });
  }

  // 兼容新旧两种前端格式
  const u = url ? new URL(url) : null;
  const baseUrl = (srv || (u ? u.origin : "")).replace(/\/+$/, "");
  const remotePath = (pth || (u ? u.pathname : "")).replace(/^\/*/, "/");
  const fullUrl = baseUrl + remotePath;

  if (!baseUrl || !remotePath) {
    return res.status(200).json({ status: 400, body: "Missing server/path or url" });
  }

  const up = (method || "GET").toUpperCase();

  // GET: 直接用 https.request 避免 webdav/node-fetch 潜在 header 问题
  if (up === "GET") {
    try {
      const resp = await httpsRequest(fullUrl, "GET", { Authorization: auth });
      return res.status(200).json({ status: resp.status, body: resp.body });
    } catch (e) {
      return res.status(200).json({ status: 502, body: String(e) });
    }
  }

  // PUT/MKCOL: 用 webdav 包（已有 MKCOL 重试逻辑）
  try {
    const client = createClient(baseUrl, { username, password });

    if (up === "PUT") {
      const doPut = async () => {
        await client.putFileContents(remotePath, body || "", { overwrite: true, contentType: "application/json" });
      };
      try {
        await doPut();
        return res.status(200).json({ status: 201, body: "" });
      } catch (putErr) {
        const code = putErr.response?.status || putErr.status || 0;
        if (code === 404 || code === 409) {
          const parent = remotePath.replace(/\/+$/, "").split("/").slice(0, -1).join("/") || "/";
          try {
            await client.createDirectory(parent);
          } catch (mkErr) {
            const mkCode = mkErr.response?.status || mkErr.status || 0;
            if (mkCode !== 405 && mkCode >= 400) {
              return res.status(200).json({ status: mkCode, body: mkErr.message || String(mkErr) });
            }
          }
          await doPut();
          return res.status(200).json({ status: 201, body: "" });
        }
        throw putErr;
      }
    }

    if (up === "MKCOL") {
      await client.createDirectory(remotePath);
      return res.status(200).json({ status: 201, body: "" });
    }

    return res.status(200).json({ status: 405, body: "Method not allowed" });
  } catch (e) {
    const status = e.response?.status || e.status || 502;
    const errBody = e.response?.statusText || e.message || String(e);
    return res.status(200).json({ status, body: errBody });
  }
}
