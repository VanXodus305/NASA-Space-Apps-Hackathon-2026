import { parseFrames, queryParams, readSearch } from "@/lib/spherex";
export async function GET(request: Request) {
  let params: URLSearchParams;
  try {
    params = queryParams(readSearch(new URL(request.url).searchParams));
  } catch (error) {
    return Response.json({ detail: (error as Error).message }, { status: 400 });
  }
  const base = process.env.SPHEREX_API_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(
      `${base.replace(/\/$/, "")}/frames?${params}`,
      { cache: "no-store", signal: AbortSignal.timeout(180_000) },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return Response.json(
        {
          detail:
            typeof body.detail === "string"
              ? body.detail
              : "The archive could not complete this request.",
        },
        { status: response.status === 400 ? 400 : 502 },
      );
    }
    const data = parseFrames(await response.json());
    // Fixed upstream PNG proxy avoids CORS and mixed content, including absolute backend URLs.
    data.frames = data.frames.map((frame) => ({
      ...frame,
      image_url: `/api/frames/${encodeURIComponent(frame.id)}.png`,
    }));
    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        detail:
          error instanceof Error && error.name === "TimeoutError"
            ? "The archive took too long to respond. Please retry; the first search may take a few minutes."
            : "The SPHEREx service is unavailable. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}
