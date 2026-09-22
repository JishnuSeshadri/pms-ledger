// Vercel serverless function — POST /api/refresh
//
// Triggers the update-mf-returns.yml GitHub Actions workflow via
// workflow_dispatch. Needs a GITHUB_TOKEN env var (set in the Vercel
// project settings, never committed) — a fine-grained PAT scoped to
// this repo only, with "Actions: write" permission and nothing else.
// The token never reaches the browser; only this function reads it.
//
// This just queues the workflow run — it doesn't wait for it to
// finish (that takes ~10-30s). The caller should tell the user to
// check back shortly rather than expecting fresh data immediately.

const OWNER = "JishnuSeshadri";
const REPO = "pms-ledger";
const WORKFLOW_FILE = "update-mf-returns.yml";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Refresh isn't configured yet (missing GITHUB_TOKEN)." });
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "pms-ledger-refresh-button",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (ghRes.status === 204) {
    return res.status(200).json({ ok: true });
  }

  const detail = await ghRes.text().catch(() => "");
  return res.status(502).json({ error: `GitHub API returned ${ghRes.status}`, detail });
}
