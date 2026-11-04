"use client";
/* Scientific PNGs must retain original pixels; do not pass through image optimization. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Crosshair,
  Info,
  LoaderCircle,
  Maximize2,
  Pause,
  Play,
  Radio,
  Search as SearchIcon,
  Share2,
  SkipBack,
  SkipForward,
  Telescope,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  defaults,
  detectors,
  parseFrames,
  queryParams,
  readSearch,
  targets,
  targetHref,
  type Search,
  type FramesResponse,
} from "@/lib/spherex";
import { StarMark } from "./cosmos";
import AnimatedContent from "./react-bits/animated-content";

const fieldClass =
  "h-11 w-full rounded-xl border border-white/12 bg-[#0c0c17] px-3 text-sm text-[#e6ddec] outline-none transition focus:border-[#b796d2] focus:ring-2 focus:ring-[#b796d2]/20";
const labelClass = "mb-2 block text-[11px] font-medium text-[#b1a5bd]";

export function Observatory() {
  const urlParams = useSearchParams();
  const [form, setForm] = useState<Search>(defaults);
  const [result, setResult] = useState<FramesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestedRelease, setRequestedRelease] = useState("auto");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [shareState, setShareState] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const player = useRef<HTMLDivElement>(null);
  const lastQuery = useRef<string | null>(null);
  const frames = result?.frames ?? [];
  const frame = frames[index];
  const canPlay = frames.length > 1 && !loading;
  const runSearch = useCallback(async (search: Search, updateUrl = true) => {
    controller.current?.abort();
    let params: URLSearchParams;
    try {
      params = queryParams(search);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
      setPlaying(false);
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    setError("");
    setResult(null);
    setIndex(0);
    setPlaying(false);
    setFailed([]);
    setLoaded([]);
    setShareState("");
    setShareUrl("");
    setRequestedRelease(search.release);
    if (updateUrl) {
      const share = new URLSearchParams({ ...search });
      lastQuery.current = share.toString();
      window.history.replaceState(null, "", `/?${share}#observatory`);
    }
    try {
      const response = await fetch(`/api/frames?${params}`, {
        signal: abort.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          `${response.status === 400 ? "Check your search" : "Archive connection problem"}: ${data.detail || "Please try again."}`,
        );
      const parsed = parseFrames(data);
      if (!abort.signal.aborted) setResult(parsed);
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "Unable to reach the archive. Please try again.",
        );
    } finally {
      if (!abort.signal.aborted) setLoading(false);
    }
  }, []);
  const query = urlParams.toString();
  // Defer URL hydration so Strict Mode can cancel its first setup safely.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || lastQuery.current === query) return;
      lastQuery.current = query;
      const params = new URLSearchParams(query);
      const search = readSearch(params);
      setForm(search);
      if (params.has("ra") || params.has("dec") || params.get("name"))
        void runSearch(search, false);
      else {
        controller.current?.abort();
        setResult(null);
        setError("");
        setLoading(false);
        setPlaying(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query, runSearch]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!playing || !canPlay) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % frames.length),
      1000 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, speed, frames.length, canPlay]);
  useEffect(() => {
    const change = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", change);
    const visibility = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const set = (key: keyof Search, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const step = (delta: number) => {
    if (frames.length) {
      setPlaying(false);
      setIndex((i) => (i + delta + frames.length) % frames.length);
    }
  };
  async function share() {
    try {
      queryParams(form);
      const url = new URL("/", window.location.origin);
      url.search = new URLSearchParams(form).toString();
      url.hash = "observatory";
      setShareUrl(url.toString());
      try {
        await navigator.clipboard.writeText(url.toString());
        setShareState("Link copied");
      } catch {
        setShareState("Copy the link below");
      }
    } catch (e) {
      setShareState((e as Error).message);
    }
  }
  const mapUrl = result
    ? `https://aladin.cds.unistra.fr/AladinLite/?target=${encodeURIComponent(`${result.query.ra} ${result.query.dec}`)}&fov=${result.query.size_deg}&survey=P%2FDSS2%2Fcolor`
    : "";
  return (
    <section
      id="observatory"
      className="mx-auto max-w-[1440px] scroll-mt-6 px-5 py-16 sm:px-10 lg:px-16"
    >
      <AnimatedContent distance={22}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 font-mono text-[10px] tracking-[.2em] text-[#a68cbc]">
              01 / THE OBSERVATORY
            </p>
            <h2 className="font-display text-3xl tracking-[-.04em] sm:text-4xl">
              A little time travel.
              <br className="sm:hidden" /> A lot to discover.
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[10px] text-[#a99db8]">
            <Radio size={12} className="text-[#bda0ce]" /> SPHEREx archive ·
            IRSA
          </div>
        </div>
      </AnimatedContent>
      <div className="grid items-start gap-5 lg:grid-cols-[310px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/10 bg-[#101019] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Crosshair size={17} className="text-[#c5a6db]" />
            <h3 className="font-display text-lg">Choose your coordinates</h3>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch(form);
            }}
          >
            <label htmlFor="name" className={labelClass}>
              OBJECT NAME
            </label>
            <Input
              id="name"
              placeholder="e.g. Barnard’s Star"
              className={fieldClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <div className="my-5 flex items-center gap-3 text-[10px] text-[#746a81]">
              <span className="h-px flex-1 bg-white/8" /> OR ENTER A POSITION{" "}
              <span className="h-px flex-1 bg-white/8" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ra" className={labelClass}>
                  RIGHT ASCENSION
                </label>
                <Input
                  id="ra"
                  className={fieldClass}
                  placeholder="133.795129"
                  value={form.ra}
                  onChange={(e) => set("ra", e.target.value)}
                  aria-describedby="coordinate-help"
                />
              </div>
              <div>
                <label htmlFor="dec" className={labelClass}>
                  DECLINATION
                </label>
                <Input
                  id="dec"
                  className={fieldClass}
                  placeholder="−7.245147"
                  value={form.dec}
                  onChange={(e) => set("dec", e.target.value)}
                  aria-describedby="coordinate-help"
                />
              </div>
            </div>
            <p
              id="coordinate-help"
              className="mt-2 text-[10px] leading-4 text-[#8b8099]"
            >
              Degrees or 08h55m10.831s / −7d14m42.53s. Coordinates take priority
              over the name.
            </p>
            <div className="mt-5">
              <label htmlFor="size" className={labelClass}>
                FIELD OF VIEW{" "}
                <span className="float-right font-normal text-[#80758f]">
                  max 0.5°
                </span>
              </label>
              <div className="relative">
                <Input
                  id="size"
                  type="number"
                  step="any"
                  min="0.000001"
                  max="0.5"
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  className={fieldClass}
                />
                <span className="pointer-events-none absolute right-8 top-3 text-xs text-[#8b8099]">
                  degrees
                </span>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="band" className={labelClass}>
                DETECTOR / WAVELENGTH
              </label>
              <select
                id="band"
                className={fieldClass}
                value={form.band}
                onChange={(e) => set("band", e.target.value)}
              >
                {detectors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} · {d.range} μm
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5">
              <label htmlFor="release" className={labelClass}>
                DATA RELEASE
              </label>
              <select
                id="release"
                className={fieldClass}
                value={form.release}
                onChange={(e) => set("release", e.target.value)}
              >
                <option value="auto">Auto · QR3 → QR2</option>
                <option value="qr3">QR3</option>
                <option value="qr2">QR2</option>
              </select>
            </div>
            <Button
              type="submit"
              isDisabled={loading}
              className="mt-6 h-12 w-full rounded-xl bg-[#ceb0df] text-sm font-semibold text-[#23172c] hover:bg-[#e1c7ef]"
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <SearchIcon size={17} />
              )}{" "}
              {loading ? "Searching the archive…" : "Search the sky"}{" "}
              {!loading && <ArrowRight size={17} className="ml-auto" />}
            </Button>
            {loading && (
              <Button
                variant="ghost"
                onPress={() => {
                  controller.current?.abort();
                  setLoading(false);
                }}
                className="mt-2 w-full text-xs text-[#bdafc9]"
              >
                <X size={14} /> Cancel search
              </Button>
            )}
          </form>
          <p className="mt-4 flex gap-2 text-[10px] leading-4 text-[#9689a5]">
            <Info size={12} className="mt-0.5 shrink-0" /> First searches can
            take 30–60 seconds or longer while images arrive from IRSA.
          </p>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 font-mono text-[9px] tracking-widest text-[#8b8099]">
              NOT SURE WHERE TO START?
            </p>
            <Link
              href={targetHref(targets[0])}
              className="flex items-center justify-between text-xs text-[#cbb1dd]"
            >
              Try Barnard’s Star <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="min-w-0 space-y-4">
          <div
            ref={player}
            className={`overflow-hidden rounded-2xl border border-white/12 bg-[#0c0c14] ${fullscreen ? "flex h-screen flex-col" : ""}`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3 sm:px-5">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#b9a9c7]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-amber-300" : result ? "bg-[#bfa0d9]" : "bg-[#71667e]"}`}
                />{" "}
                BLINK VIEWER
              </span>
              <div className="flex gap-1">
                <Button
                  isIconOnly
                  aria-label="Share search"
                  variant="ghost"
                  onPress={share}
                  className="h-9 w-9 text-[#ab9db8]"
                >
                  <Share2 size={15} />
                </Button>
                <Button
                  isIconOnly
                  aria-label={
                    fullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  variant="ghost"
                  onPress={async () => {
                    try {
                      if (document.fullscreenElement)
                        await document.exitFullscreen();
                      else await player.current?.requestFullscreen();
                    } catch {
                      setShareState(
                        "Fullscreen is unavailable in this browser.",
                      );
                    }
                  }}
                  className="h-9 w-9 text-[#ab9db8]"
                >
                  <Maximize2 size={15} />
                </Button>
              </div>
            </div>
            <div
              className={`relative flex min-h-[330px] w-full min-w-0 items-center justify-center overflow-hidden bg-[#05050a] ${fullscreen ? "flex-1" : "aspect-[1.65/1]"}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(#6e5d8625_1px,transparent_1px),linear-gradient(90deg,#6e5d8625_1px,transparent_1px)] bg-size-[56px_56px]"
              />
              {!loading &&
                !error &&
                frames.map((f, i) => (
                  <img
                    key={f.id}
                    src={f.image_url}
                    alt={`SPHEREx ${f.detector} observation at ${f.obs_iso}`}
                    className={`absolute inset-0 h-full w-full object-contain [image-rendering:pixelated] ${i === index && !failed.includes(f.id) ? "visible" : "invisible"}`}
                    onLoad={() =>
                      setLoaded((old) =>
                        old.includes(f.id) ? old : [...old, f.id],
                      )
                    }
                    onError={() =>
                      setFailed((old) =>
                        old.includes(f.id) ? old : [...old, f.id],
                      )
                    }
                  />
                ))}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative max-w-sm px-6 text-center"
                    role="status"
                  >
                    <LoaderCircle
                      className="mx-auto mb-5 animate-spin text-[#c5a6db] motion-reduce:animate-none"
                      size={34}
                    />
                    <h3 className="font-display text-xl">
                      Collecting a moment in time
                    </h3>
                    <p className="mt-3 text-xs leading-6 text-[#9f91af]">
                      Searching coverage and preparing infrared cutouts.
                      <br />
                      The first visit to a field can take a few minutes.
                    </p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative max-w-md px-6 text-center"
                    role="alert"
                  >
                    <TriangleAlert
                      size={30}
                      className="mx-auto mb-4 text-[#dabda7]"
                    />
                    <h3 className="font-display text-xl">
                      We couldn’t reach that sky
                    </h3>
                    <p className="mt-3 break-words text-sm leading-6 text-[#b1a4bd]">
                      {error}
                    </p>
                    <Button
                      onPress={() => runSearch(form)}
                      variant="ghost"
                      className="mt-3 text-[#d5bce6]"
                    >
                      Try again <ArrowRight size={14} />
                    </Button>
                  </motion.div>
                ) : !result || !frames.length ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full min-w-0 px-6 text-center"
                    role="status"
                  >
                    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#b598cb]/20">
                      <div className="absolute inset-3 rounded-full border border-dashed border-[#b598cb]/25" />
                      <StarMark className="h-10 w-10 text-[#b99fce]" />
                    </div>
                    <h3 className="font-display text-xl text-[#e0d4e9]">
                      {result
                        ? "A quiet patch of sky"
                        : "Your next discovery starts here"}
                    </h3>
                    <p className="mx-auto mt-3 max-w-xs text-xs leading-6 text-[#9587a5]">
                      {result
                        ? "No images cover this position in the selected detector and release. Try Auto, another detector, or a nearby field."
                        : "Enter a position or choose a target. We’ll bring you the same sky, at different moments."}
                    </p>
                    <span className="mt-6 inline-block font-mono text-[9px] tracking-[.2em] text-[#746580]">
                      {result ? "NO COVERAGE FOUND" : "AWAITING COORDINATES"}
                    </span>
                  </motion.div>
                ) : frame && failed.includes(frame.id) ? (
                  <div
                    key="failed"
                    className="relative px-6 text-center"
                    role="alert"
                  >
                    <TriangleAlert
                      size={28}
                      className="mx-auto mb-3 text-[#d7b79c]"
                    />
                    <p>This frame couldn’t load.</p>
                    <p className="mt-2 text-xs text-[#a99bb7]">
                      Use the timeline to inspect another observation.
                    </p>
                  </div>
                ) : frame && !loaded.includes(frame.id) ? (
                  <div
                    key="image-loading"
                    className="relative flex items-center gap-2 text-sm text-[#c5a6db]"
                    role="status"
                  >
                    <LoaderCircle size={18} className="animate-spin" /> Loading
                    observation…
                  </div>
                ) : null}
              </AnimatePresence>
              <span className="pointer-events-none absolute left-4 top-4 font-mono text-[9px] text-[#9e90ae]">
                {result
                  ? `${result.query.band} / ${result.query.release.toUpperCase()}`
                  : "SPHEREx / NEAR-INFRARED"}
              </span>
              <span className="pointer-events-none absolute bottom-4 right-4 font-mono text-[9px] text-[#9e90ae]">
                {frame
                  ? `FRAME ${String(index + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`
                  : "FRAME — / —"}
              </span>
            </div>
            <div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
              <div className="mb-3 flex justify-between font-mono text-[9px] text-[#8e809e]">
                <span>{frames[0]?.obs_iso.slice(0, 10) || "EARLIEST"}</span>
                <span>{frames.at(-1)?.obs_iso.slice(0, 10) || "LATEST"}</span>
              </div>
              <input
                aria-label="Observation timeline"
                type="range"
                min={0}
                max={Math.max(0, frames.length - 1)}
                value={index}
                disabled={!canPlay}
                onChange={(e) => {
                  setIndex(Number(e.target.value));
                  setPlaying(false);
                }}
                className="block h-2 w-full cursor-pointer accent-[#c9a5e0] disabled:cursor-default disabled:opacity-30"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    aria-label="Previous frame"
                    variant="ghost"
                    isDisabled={!canPlay}
                    onPress={() => step(-1)}
                    className="h-10 w-10 text-[#c9bad5]"
                  >
                    <SkipBack size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label={playing ? "Pause playback" : "Play playback"}
                    isDisabled={!canPlay}
                    onPress={() => setPlaying(!playing)}
                    className="h-10 w-10 rounded-full bg-[#cfb0e0] text-[#23182d]"
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Next frame"
                    variant="ghost"
                    isDisabled={!canPlay}
                    onPress={() => step(1)}
                    className="h-10 w-10 text-[#c9bad5]"
                  >
                    <SkipForward size={16} />
                  </Button>
                  <select
                    aria-label="Playback speed"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="ml-2 h-9 rounded-lg border border-white/10 bg-[#15111f] px-2 font-mono text-[10px] text-[#baacc7]"
                  >
                    {[0.5, 1, 2, 4].map((s) => (
                      <option value={s} key={s}>
                        {s}× speed
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-[#cfbfdc]">
                    {frame
                      ? frame.obs_iso.replace("T", " · ").replace("Z", " UTC")
                      : "No observation selected"}
                  </p>
                  <p className="mt-1 text-[10px] text-[#81738f]">
                    {frame
                      ? `${frame.detector} · ${frame.wavelength_um.join("–")} μm · ${index + 1} of ${frames.length}`
                      : "Up to 8 epochs · oldest first"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {shareState && (
            <div
              role="status"
              className="rounded-xl border border-[#bfa0d9]/20 bg-[#181020] p-3 text-xs text-[#d0b4e2]"
            >
              <span className="flex items-center gap-2">
                {shareState === "Link copied" && <Check size={14} />}{" "}
                {shareState}
              </span>
              {shareUrl && (
                <Input
                  aria-label="Share URL"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="mt-2 w-full bg-[#0e0a15] text-xs"
                />
              )}
            </div>
          )}
          {result && (
            <div className="rounded-xl border border-white/10 bg-[#101019] p-4">
              <p className="mb-3 font-mono text-[9px] tracking-widest text-[#a48cb8]">
                ACTUAL SEARCH POSITION
              </p>
              <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-5">
                {[
                  ["RA", `${result.query.ra}°`],
                  ["DEC", `${result.query.dec}°`],
                  ["FIELD", `${result.query.size_deg}°`],
                  ["DETECTOR", result.query.band],
                  ["RELEASE", result.query.release.toUpperCase()],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="mb-1 text-[9px] text-[#85758f]">{key}</dt>
                    <dd className="font-mono text-[11px] text-[#cdbdd8]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              {requestedRelease === "auto" &&
                result.query.release === "qr2" && (
                  <p
                    role="status"
                    className="mt-4 text-xs leading-5 text-[#d8bd9c]"
                  >
                    Auto fallback: no QR3 coverage for this field and detector.
                    Showing QR2.
                  </p>
                )}
            </div>
          )}
          {result && (result.dropped > 0 || failed.length > 0) && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-amber-200/15 bg-amber-200/5 p-4 text-xs leading-5 text-[#dec39e]"
            >
              <TriangleAlert size={16} className="shrink-0" />
              {result.dropped > 0
                ? `${result.dropped} cutout(s) failed at the archive. `
                : ""}
              {failed.length > 0
                ? `${failed.length} image(s) failed to load in your browser. `
                : ""}
              The available observations remain usable.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border border-white/10 bg-[#101019] p-5">
              <p className="mb-3 flex items-center gap-2 text-xs text-[#d0badf]">
                <Telescope size={15} /> A tip from the observatory
              </p>
              <p className="text-xs leading-6 text-[#9688a6]">
                Look for a point that shifts against its neighbors. A changing
                glow may indicate a variable star. Compare the same detector and
                similar wavelengths.
              </p>
              <Link
                href="/about#reading-the-sky"
                className="mt-3 inline-flex items-center gap-2 text-[11px] text-[#c4a5d7]"
              >
                Learn what to look for <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#101019]">
              <div className="flex items-center justify-between px-4 py-3 text-[10px] text-[#b7a6c6]">
                <span className="flex items-center gap-2">
                  <Crosshair size={12} /> SKY CONTEXT · DSS2
                </span>
                {result && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open sky map in Aladin Lite"
                  >
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
              {result ? (
                <iframe
                  key={mapUrl}
                  src={mapUrl}
                  title="Aladin Lite sky map centered on the returned coordinates"
                  loading="lazy"
                  className="h-48 w-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-32 items-center justify-center gap-2 border-t border-white/5 font-mono text-[9px] text-[#756583]">
                  <Crosshair size={25} className="text-[#645472]" /> YOUR FIELD,
                  IN CONTEXT
                </div>
              )}
              <p className="px-4 py-2 text-[9px] text-[#81728f]">
                Aladin Lite / CDS · reference survey, not SPHEREx
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-start gap-2 text-[10px] leading-5 text-[#81748e]">
        <Info size={13} className="mt-1 shrink-0" />
        <p>
          These images are independently contrast-stretched and are not
          reprojected to a common grid. Rotation, wavelength, and scaling can
          mimic changes. Use the viewer to find candidates, then verify with
          calibrated data.
        </p>
      </div>
      <div className="mt-16 flex flex-col justify-between gap-6 rounded-2xl border border-[#b296c7]/15 bg-linear-to-r from-[#21162d] via-[#141020] to-[#101019] p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="font-mono text-[9px] tracking-widest text-[#a38cb6]">
            SOMEWHERE TO BEGIN
          </p>
          <h3 className="mt-3 font-display text-2xl tracking-tight">
            Five little corners of a very big universe.
          </h3>
          <p className="mt-2 text-xs text-[#a092af]">
            Meet the fast movers, faint neighbors, and stars that won’t sit
            still.
          </p>
        </div>
        <Link
          href="/targets"
          className="flex shrink-0 items-center gap-6 rounded-full border border-[#c4a6d7]/30 px-6 py-3 text-sm text-[#d9c3e8] hover:bg-white/5"
        >
          Explore targets <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
