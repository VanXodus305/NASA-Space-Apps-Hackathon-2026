export const detectors = [
  { id: "D1", range: "0.75–1.09", resolving: 39 },
  { id: "D2", range: "1.10–1.62", resolving: 41 },
  { id: "D3", range: "1.63–2.41", resolving: 41 },
  { id: "D4", range: "2.42–3.82", resolving: 35 },
  { id: "D5", range: "3.83–4.41", resolving: 112 },
  { id: "D6", range: "4.42–5.00", resolving: 128 },
] as const;
export type Search = {
  ra: string;
  dec: string;
  name: string;
  size: string;
  band: string;
  release: string;
};
export const defaults: Search = {
  ra: "",
  dec: "",
  name: "",
  size: "0.1",
  band: "D2",
  release: "auto",
};
export type Frame = {
  id: string;
  obs_mjd: number;
  obs_iso: string;
  detector: string;
  wavelength_um: [number, number];
  image_url: string;
};
export type FramesResponse = {
  query: {
    ra: number;
    dec: number;
    size_deg: number;
    band: string;
    release: string;
  };
  dropped: number;
  frames: Frame[];
};
export const targets = [
  {
    name: "Barnard’s Star",
    tag: "NEARBY STAR",
    type: "Motion",
    description:
      "A stellar neighbor on the move. Watch one of the sky’s fastest-moving stars drift against the distant background.",
    search: { name: "Barnard's Star" },
    color: "#d0b5ed",
    number: "01",
  },
  {
    name: "WISE 0855",
    tag: "COLD BROWN DWARF",
    type: "Motion",
    description:
      "Cold, faint, and quietly racing through space. Look for a subtle point of light shifting between observations.",
    search: { ra: "08h55m10.831s", dec: "-7d14m42.53s" },
    color: "#94accd",
    number: "02",
  },
  {
    name: "Epsilon Indi B",
    tag: "BROWN DWARF PAIR",
    type: "Motion",
    description:
      "Two faint brown dwarfs orbit a bright star. Explore the field and look for their shared motion.",
    search: { name: "eps Ind B" },
    color: "#ddb8ac",
    number: "03",
  },
  {
    name: "RW Aurigae",
    tag: "VARIABLE STAR",
    type: "Brightness",
    description:
      "Same place, different light. Compare epochs to look for changes in this young star’s brightness.",
    search: { name: "RW Aur" },
    color: "#beafd9",
    number: "04",
  },
  {
    name: "R Draconis",
    tag: "VARIABLE STAR",
    type: "Brightness",
    description:
      "A star with a changing glow. Slow the player down and watch its brightness relative to nearby stars.",
    search: { name: "R Dra" },
    color: "#c9a4bd",
    number: "05",
  },
] as const;
export function targetHref(target: (typeof targets)[number]) {
  return (
    "/?" +
    new URLSearchParams({ ...defaults, ...target.search }).toString() +
    "#observatory"
  );
}
export function readSearch(params: URLSearchParams): Search {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      params.get(key) ?? (key === "size" ? params.get("fov") : null) ?? value,
    ]),
  ) as Search;
}
// Explicit units are accepted by the backend's Astropy parser.
export function coordinate(value: string, ra: boolean): string {
  const clean = value.trim().replace(/−/g, "-");
  const parts = clean.split(/[:\s]+/);
  if (parts.length === 3 && parts.every((p) => /^[+-]?\d+(\.\d+)?$/.test(p)))
    return `${parts[0]}${ra ? "h" : "d"}${parts[1]}m${parts[2]}s`;
  return clean;
}
export function queryParams(search: Search): URLSearchParams {
  const ra = coordinate(search.ra, true),
    dec = coordinate(search.dec, false);
  if (Boolean(ra) !== Boolean(dec))
    throw new Error("Enter both RA and Dec, or clear both to search by name.");
  if (!ra && !search.name.trim())
    throw new Error("Enter a sky position or an object name to begin.");
  const size = Number(search.size);
  if (!Number.isFinite(size) || size <= 0 || size > 0.5)
    throw new Error(
      "Field of view must be greater than 0 and at most 0.5 degrees.",
    );
  if (!detectors.some((d) => d.id === search.band))
    throw new Error("Choose a detector from D1 through D6.");
  if (!["auto", "qr2", "qr3"].includes(search.release))
    throw new Error("Choose Auto, QR2, or QR3.");
  const params = new URLSearchParams({ size: String(size), band: search.band });
  if (ra && dec) {
    params.set("ra", ra);
    params.set("dec", dec);
  } else params.set("name", search.name.trim());
  if (search.release !== "auto") params.set("release", search.release);
  return params;
}
export function parseFrames(value: unknown): FramesResponse {
  const data = value as FramesResponse;
  if (
    !data?.query ||
    !Number.isFinite(data.query.ra) ||
    !Number.isFinite(data.query.dec) ||
    !Number.isFinite(data.query.size_deg) ||
    typeof data.query.band !== "string" ||
    typeof data.query.release !== "string" ||
    !Number.isInteger(data.dropped) ||
    !Array.isArray(data.frames)
  )
    throw new Error(
      "The archive returned an unexpected response. Please try again.",
    );
  if (
    data.frames.some(
      (f) =>
        !f ||
        typeof f.id !== "string" ||
        typeof f.image_url !== "string" ||
        !Number.isFinite(f.obs_mjd) ||
        !Number.isFinite(Date.parse(f.obs_iso)) ||
        typeof f.detector !== "string" ||
        !Array.isArray(f.wavelength_um) ||
        f.wavelength_um.length !== 2 ||
        !f.wavelength_um.every(Number.isFinite),
    )
  )
    throw new Error(
      "The archive returned incomplete frame metadata. Please try again.",
    );
  return {
    ...data,
    frames: [...data.frames].sort((a, b) => a.obs_mjd - b.obs_mjd).slice(0, 8),
  };
}
