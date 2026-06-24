export default async function handler(req, res) {
  const { url, method, body, auth } = req.body;
  const headers = { Authorization: auth || "", "Content-Type": "application/octet-stream" };
  const doFetch = async () => fetch(url, { method: method || "GET", headers, body: body || undefined });

  try {
    let resp = await doFetch();
    // PUT 404/409 → try MKCOL parent, then retry (Nutstore uses 409 for missing ancestors)
    if (method === "PUT" && (resp.status === 404 || resp.status === 409)) {
      const parts = url.replace(/\/+$/, "").split("/");
      parts.pop();
      const parentUrl = parts.join("/");
      const mk = await fetch(parentUrl, { method: "MKCOL", headers: { Authorization: auth || "" } });
      if (mk.status < 400 || mk.status === 405) resp = await doFetch();
    }
    res.status(200).json({ status: resp.status, body: await resp.text() });
  } catch (e) {
    res.status(502).json({ status: 502, body: String(e) });
  }
}
