import { createClient } from "webdav";

function getAuthUserPass(auth) {
  if (!auth || !auth.startsWith("Basic ")) return { username: "", password: "" };
  const decoded = Buffer.from(auth.slice(6), "base64").toString();
  const idx = decoded.indexOf(":");
  return { username: decoded.slice(0, idx), password: decoded.slice(idx + 1) };
}

export default async function handler(req, res) {
  const { server, method, path, body, auth } = req.body;
  const { username, password } = getAuthUserPass(auth);

  if (!username || !password) {
    return res.status(200).json({ status: 401, body: "Missing or invalid credentials" });
  }

  const client = createClient(server, { username, password });
  const up = (method || "GET").toUpperCase();

  try {
    if (up === "GET") {
      const data = await client.getFileContents(path, { format: "text" });
      return res.status(200).json({ status: 200, body: data });
    }

    if (up === "PUT") {
      const doPut = async () => {
        await client.putFileContents(path, body || "", { overwrite: true, contentType: "application/json" });
      };
      try {
        await doPut();
        return res.status(200).json({ status: 201, body: "" });
      } catch (putErr) {
        const code = putErr.response?.status || putErr.status || 0;
        if (code === 404 || code === 409) {
          const parent = path.replace(/\/+$/, "").split("/").slice(0, -1).join("/") || "/";
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
      await client.createDirectory(path);
      return res.status(200).json({ status: 201, body: "" });
    }

    return res.status(200).json({ status: 405, body: "Method not allowed" });
  } catch (e) {
    const status = e.response?.status || e.status || 502;
    const errBody = e.response?.statusText || e.message || String(e);
    return res.status(200).json({ status, body: errBody });
  }
}
