"use client";
/* Scientific PNGs must retain original pixels; do not pass through image optimization. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Form, Slider } from "@heroui/react";
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
  searchableTargets,
  targets,
  targetHref,
  type Search,
  type FramesResponse,
} from "@/lib/spherex";
import { StarMark } from "./cosmos";
import AnimatedContent from "./react-bits/animated-content";
import {
  FieldOfView,
  SkySelect,
  SkyTextField,
  TargetAutocomplete,
} from "./sky-controls";
import { SkyContextMap } from "./aladin-map";

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
  const [fullscreenHost, setFullscreenHost] = useState<Element | null>(null);
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
    const change = () => {
      setFullscreen(Boolean(document.fullscreenElement));
      setFullscreenHost(document.fullscreenElement);
    };
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
  return (
    <section
      id="observatory"
      className="mx-auto max-w-360 scroll-mt-6 px-5 py-16 sm:px-10 sm:py-20 lg:px-16"
    >
      <AnimatedContent distance={22}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 font-mono text-[11px] tracking-[.14em] text-ink-dim">
              01 / THE OBSERVATORY
            </p>
            <h2 className="font-display text-3xl tracking-[-.03em] sm:text-4xl">
              A little time travel.
              <br className="sm:hidden" /> A lot to discover.
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[11px] text-ink-dim">
            <Radio size={12} className="text-lilac" /> SPHEREx archive · IRSA
          </div>
        </div>
      </AnimatedContent>
      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-8">
        <div className="rounded-xl border border-white/10 bg-panel p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Crosshair size={17} className="text-lilac" />
            <h3 className="font-display text-lg">Choose your coordinates</h3>
          </div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch(form);
            }}
          >
            <TargetAutocomplete
              value={form.name}
              options={searchableTargets}
              onSelect={(target) =>
                setForm((current) => ({
                  ...current,
                  name: target?.name ?? "",
                  ra: target?.ra ?? "",
                  dec: target?.dec ?? "",
                }))
              }
            />
            <div className="my-5 flex items-center gap-3 text-[11px] text-ink-faint">
              <span className="h-px flex-1 bg-white/8" /> OR ENTER A POSITION{" "}
              <span className="h-px flex-1 bg-white/8" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SkyTextField
                label="RIGHT ASCENSION"
                value={form.ra}
                onChange={(value) => set("ra", value)}
                placeholder="RA in degrees"
                descriptionId="coordinate-help"
              />
              <SkyTextField
                label="DECLINATION"
                value={form.dec}
                onChange={(value) => set("dec", value)}
                placeholder="Dec in degrees"
                descriptionId="coordinate-help"
              />
            </div>
            <p
              id="coordinate-help"
              className="mt-2 text-[11px] leading-4 text-ink-faint"
            >
              Enter both values as decimal degrees (RA: 0–360, Dec: −90 to +90).
              You can also use RA 08:55:10.831 and Dec −07:14:42.53.
            </p>
            <div className="mt-5">
              <FieldOfView
                value={form.size}
                onChange={(value) => set("size", value)}
              />
            </div>
            <div className="mt-5">
              <SkySelect
                label="DETECTOR / WAVELENGTH"
                value={form.band}
                onChange={(value) => set("band", value)}
                options={detectors.map((d) => ({
                  id: d.id,
                  label: `${d.id} · ${d.range} μm`,
                  description: `Spectral resolving power R = ${d.resolving}`,
                }))}
              />
            </div>
            <div className="mt-5">
              <SkySelect
                label="DATA RELEASE"
                value={form.release}
                onChange={(value) => set("release", value)}
                options={[
                  {
                    id: "auto",
                    label: "Auto · QR3 → QR2",
                    description: "Use QR2 when QR3 has no coverage",
                  },
                  {
                    id: "qr3",
                    label: "QR3",
                    description: "Quick Release 3 only",
                  },
                  {
                    id: "qr2",
                    label: "QR2",
                    description: "Quick Release 2 only",
                  },
                ]}
              />
            </div>
            <Button
              type="submit"
              isDisabled={loading}
              className="mt-6 h-12 w-full rounded-lg bg-lilac text-sm font-semibold text-void hover:bg-lilac-strong"
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
                className="mt-2 w-full text-xs text-ink-dim"
              >
                <X size={14} /> Cancel search
              </Button>
            )}
          </Form>
          <p className="mt-4 flex gap-2 text-[11px] leading-4 text-ink-faint">
            <Info size={12} className="mt-0.5 shrink-0" /> First searches can
            take 30–60 seconds or longer while images arrive from IRSA.
          </p>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 font-mono text-[11px] tracking-[.1em] text-ink-faint">
              NOT SURE WHERE TO START?
            </p>
            <Link
              href={targetHref(targets[0])}
              className="flex items-center justify-between text-xs text-lilac"
            >
              Try Barnard’s Star <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="min-w-0 space-y-4">
          <div
            ref={player}
            className={`overflow-hidden rounded-xl border border-white/12 bg-panel ${fullscreen ? "flex h-screen flex-col" : ""}`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3 sm:px-5">
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-[.1em] text-lilac">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-amber-300" : result ? "bg-lilac" : "bg-[#71667e]"}`}
                />{" "}
                BLINK VIEWER
              </span>
              <div className="flex gap-1">
                <Button
                  isIconOnly
                  aria-label="Share search"
                  variant="ghost"
                  onPress={share}
                  className="h-9 w-9 text-ink-dim"
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
                  className="h-9 w-9 text-ink-dim"
                >
                  <Maximize2 size={15} />
                </Button>
              </div>
            </div>
            <div
              className={`relative flex min-h-[330px] w-full min-w-0 items-center justify-center overflow-hidden bg-void ${fullscreen ? "flex-1" : "aspect-[1.65/1]"}`}
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
                      className="mx-auto mb-5 animate-spin text-lilac motion-reduce:animate-none"
                      size={34}
                    />
                    <h3 className="font-display text-xl">
                      Collecting a moment in time
                    </h3>
                    <p className="mt-3 text-[13px] leading-6 text-ink-faint">
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
                    <p className="mt-3 break-words text-sm leading-6 text-ink-dim">
                      {error}
                    </p>
                    <Button
                      onPress={() => runSearch(form)}
                      variant="ghost"
                      className="mt-3 text-ink"
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
                    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-lilac/20">
                      <div className="absolute inset-3 rounded-full border border-dashed border-lilac/25" />
                      <StarMark className="h-10 w-10 text-lilac" />
                    </div>
                    <h3 className="font-display text-xl text-ink">
                      {result
                        ? "A quiet patch of sky"
                        : "Your next discovery starts here"}
                    </h3>
                    <p className="mx-auto mt-3 max-w-xs text-[13px] leading-6 text-ink-faint">
                      {result
                        ? "No images cover this position in the selected detector and release. Try Auto, another detector, or a nearby field."
                        : "Enter a position or choose a target. We’ll bring you the same sky, at different moments."}
                    </p>
                    <span className="mt-6 inline-block font-mono text-[11px] tracking-[.14em] text-ink-faint">
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
                    <p className="mt-2 text-xs text-ink-dim">
                      Use the timeline to inspect another observation.
                    </p>
                  </div>
                ) : frame && !loaded.includes(frame.id) ? (
                  <div
                    key="image-loading"
                    className="relative flex items-center gap-2 text-sm text-lilac"
                    role="status"
                  >
                    <LoaderCircle size={18} className="animate-spin" /> Loading
                    observation…
                  </div>
                ) : null}
              </AnimatePresence>
              <span className="pointer-events-none absolute left-4 top-4 font-mono text-[11px] text-ink-faint">
                {result
                  ? `${result.query.band} / ${result.query.release.toUpperCase()}`
                  : "SPHEREx / NEAR-INFRARED"}
              </span>
              <span className="pointer-events-none absolute bottom-4 right-4 font-mono text-[11px] text-ink-faint">
                {frame
                  ? `FRAME ${String(index + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`
                  : "FRAME — / —"}
              </span>
            </div>
            <div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
              <div className="mb-3 flex justify-between gap-3 font-mono text-[10px] text-ink-faint sm:text-[11px]">
                <span>{frames[0]?.obs_iso.slice(0, 10) || "EARLIEST"}</span>
                <span>{frames.at(-1)?.obs_iso.slice(0, 10) || "LATEST"}</span>
              </div>
              <Slider
                aria-label="Observation timeline"
                minValue={0}
                maxValue={Math.max(1, frames.length - 1)}
                step={1}
                value={index}
                isDisabled={!canPlay}
                onChange={(value) => {
                  setIndex(Array.isArray(value) ? value[0] : value);
                  setPlaying(false);
                }}
                className="w-full gap-0 data-disabled:opacity-35"
              >
                <Slider.Track className="h-1.5 rounded-full bg-white/15">
                  <Slider.Fill className="bg-lilac" />
                  <Slider.Thumb className="size-4 border-2 border-void bg-lilac" />
                </Slider.Track>
              </Slider>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-1">
                  <Button
                    isIconOnly
                    aria-label="Previous frame"
                    variant="ghost"
                    isDisabled={!canPlay}
                    onPress={() => step(-1)}
                    className="h-10 w-10 text-ink-dim"
                  >
                    <SkipBack size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label={playing ? "Pause playback" : "Play playback"}
                    isDisabled={!canPlay}
                    onPress={() => setPlaying(!playing)}
                    className="h-10 w-10 rounded-full bg-lilac text-void"
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Next frame"
                    variant="ghost"
                    isDisabled={!canPlay}
                    onPress={() => step(1)}
                    className="h-10 w-10 text-ink-dim"
                  >
                    <SkipForward size={16} />
                  </Button>
                  <SkySelect
                    label="Playback speed"
                    compact
                    value={String(speed)}
                    onChange={(value) => setSpeed(Number(value))}
                    options={[0.5, 1, 2, 4].map((s) => ({
                      id: String(s),
                      label: `${s}× speed`,
                    }))}
                    portalContainer={fullscreenHost}
                  />
                </div>
                <div className="border-t border-white/8 pt-3 text-left sm:border-0 sm:pt-0 sm:text-right">
                  <p className="font-mono text-[11px] text-ink-dim">
                    {frame
                      ? frame.obs_iso.replace("T", " · ").replace("Z", " UTC")
                      : "No observation selected"}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-faint">
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
              className="rounded-xl border border-lilac/20 bg-panel p-3 text-xs text-ink"
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
                  className="mt-2 w-full bg-panel-2 text-xs"
                />
              )}
            </div>
          )}
          {result && (
            <div className="rounded-2xl border border-white/10 bg-panel/70 p-5 sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] tracking-[.1em] text-ink-dim">
                  ACTUAL SEARCH POSITION
                </p>
                <span className="rounded-full border border-lilac/20 bg-lilac/10 px-2.5 py-1 font-mono text-[10px] tracking-[.08em] text-lilac">
                  {result.query.release.toUpperCase()} RELEASE
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-5 text-xs sm:grid-cols-4">
                {[
                  ["RA", `${result.query.ra}°`],
                  ["DEC", `${result.query.dec}°`],
                  ["FIELD", `${result.query.size_deg}°`],
                  ["DETECTOR", result.query.band],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="mb-1 font-mono text-[10px] tracking-[.08em] text-ink-faint">
                      {key}
                    </dt>
                    <dd className="font-mono text-xs text-ink-dim sm:text-[11px]">
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
          <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,.72fr)_minmax(380px,1.28fr)]">
            <div className="flex min-h-55 flex-col rounded-2xl border border-white/10 bg-panel/55 p-5 sm:p-6">
              <p className="mb-3 flex items-center gap-2 text-xs text-lilac">
                <Telescope size={15} /> A tip from the observatory
              </p>
              <p className="text-[13px] leading-6 text-ink-faint">
                Look for a point that shifts against its neighbors. A changing
                glow may indicate a variable star. Compare the same detector and
                similar wavelengths.
              </p>
              <div className="mt-auto pt-6">
                <Link
                  href="/about#reading-the-sky"
                  className="inline-flex items-center gap-2 text-[11px] text-lilac"
                >
                  Learn what to look for <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
            {result ? (
              <SkyContextMap
                key={`${result.query.ra}-${result.query.dec}-${result.query.size_deg}`}
                ra={result.query.ra}
                dec={result.query.dec}
                fov={result.query.size_deg}
              />
            ) : (
              <div className="flex min-h-55 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-panel font-mono text-[11px] text-ink-faint">
                <Crosshair size={25} className="text-ink-faint" /> YOUR FIELD,
                IN CONTEXT
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-start gap-2 text-[11px] leading-5 text-ink-faint">
        <Info size={13} className="mt-1 shrink-0" />
        <p>
          These images are independently contrast-stretched and are not
          reprojected to a common grid. Rotation, wavelength, and scaling can
          mimic changes. Use the viewer to find candidates, then verify with
          calibrated data.
        </p>
      </div>
      <div className="mt-16 flex flex-col justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-[11px] tracking-[.1em] text-ink-dim">
            SOMEWHERE TO BEGIN
          </p>
          <h3 className="mt-3 font-display text-2xl tracking-tight">
            Five little corners of a very big universe.
          </h3>
          <p className="mt-2 text-xs text-ink-faint">
            Meet the fast movers, faint neighbors, and stars that won’t sit
            still.
          </p>
        </div>
        <Link
          href="/targets"
          className="flex shrink-0 items-center gap-4 rounded-lg border border-white/20 px-5 py-3 text-sm text-ink hover:bg-white/5"
        >
          Explore targets <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
