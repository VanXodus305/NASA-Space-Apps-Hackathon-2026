import { test } from "node:test";
import assert from "node:assert/strict";
import {
  coordinate,
  defaults,
  parseFrames,
  queryParams,
  readSearch,
} from "../lib/spherex";
test("coordinate notation and precedence match Astropy contract", () => {
  assert.equal(coordinate("08:55:10.831", true), "08h55m10.831s");
  assert.equal(coordinate("−7 14 42.53", false), "-7d14m42.53s");
  const p = queryParams({
    ...defaults,
    ra: "133.795",
    dec: "-7.245",
    name: "ignored",
  });
  assert.equal(p.has("name"), false);
  assert.equal(p.has("release"), false);
  assert.equal(
    queryParams({ ...defaults, name: "RW Aur", release: "qr2" }).get("release"),
    "qr2",
  );
});
test("reject invalid query settings and support legacy fov URLs", () => {
  for (const bad of [
    {},
    { name: "x", size: "0" },
    { name: "x", size: "NaN" },
    { name: "x", size: ".6" },
    { ra: "1", name: "x" },
    { name: "x", release: "QR1" },
    { name: "x", band: "D7" },
  ])
    assert.throws(() => queryParams({ ...defaults, ...bad }));
  assert.equal(readSearch(new URLSearchParams("fov=0.3")).size, "0.3");
});
test("reject malformed API responses", () => {
  assert.throws(() => parseFrames({ frames: [] }));
  assert.throws(() =>
    parseFrames({
      query: { ra: 1, dec: 2, size_deg: 0.1, band: "D2", release: "qr2" },
      dropped: 0,
      frames: [{}],
    }),
  );
});

test("proxy preserves actual metadata, sorts frames, omits auto, and maps PNG paths", async (t) => {
  const { GET } = await import("../app/api/frames/route");
  let upstream = "";
  t.mock.method(globalThis, "fetch", async (input: string) => {
    upstream = String(input);
    return Response.json({
      query: { ra: 1, dec: 2, size_deg: 0.1, band: "D2", release: "qr2" },
      dropped: 1,
      frames: [2, 1].map((i) => ({
        id: `000000000000000${i}`,
        obs_mjd: 60000 + i,
        obs_iso: `2025-06-0${i}T00:00:00Z`,
        detector: "D2",
        wavelength_um: [1.1, 1.62],
        image_url: `https://example.org/frames/000000000000000${i}.png`,
      })),
    });
  });
  const response = await GET(
    new Request("http://localhost/api/frames?name=RW+Aur&release=auto"),
  );
  const data = await response.json();
  assert.equal(new URL(upstream).searchParams.has("release"), false);
  assert.equal(data.query.release, "qr2");
  assert.equal(data.dropped, 1);
  assert.equal(data.frames[0].image_url, "/api/frames/0000000000000001.png");
});
test("proxy forwards useful 400 errors and handles upstream outages", async (t) => {
  const { GET } = await import("../app/api/frames/route");
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ detail: "could not parse ra/dec" }, { status: 400 }),
  );
  const request = new Request("http://localhost/api/frames?name=test");
  const bad = await GET(request);
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).detail, "could not parse ra/dec");
  fetchMock.mock.mockImplementation(async () => {
    throw new Error("connection refused");
  });
  assert.equal((await GET(request)).status, 502);
  assert.equal(
    (await GET(new Request("http://localhost/api/frames?name=test&size=0.8")))
      .status,
    400,
  );
});
