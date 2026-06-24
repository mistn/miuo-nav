export default async function handler(req, res) {
  const { url, method, body, auth } = req.body;
  try {
    const resp = await fetch(url, {
      method: method || "GET",
      headers: { Authorization: auth || "", "Content-Type": "application/octet-stream" },
      body: body || undefined,
    });
    res.status(200).json({ status: resp.status, body: await resp.text() });
  } catch (e) {
    res.status(502).json({ status: 502, body: String(e) });
  }
}
