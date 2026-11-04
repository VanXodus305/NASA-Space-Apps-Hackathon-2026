export async function GET(
  _request: Request,
  context: { params: Promise<{ frame: string }> },
) {
  const { frame } = await context.params;
  if (!/^[a-zA-Z0-9]{16}\.png$/.test(frame))
    return new Response("Unknown frame", { status: 404 });
  const base = process.env.SPHEREX_API_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/frames/${frame}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      return new Response("Frame unavailable", {
        status: response.status === 404 ? 404 : 502,
      });
    return new Response(response.body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Frame unavailable", { status: 502 });
  }
}
