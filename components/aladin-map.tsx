"use client";

/* External survey cutouts must retain their original pixels. */
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import {
  ArrowUpRight,
  Crosshair,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

const surveyLayers = [
  {
    id: "unwise-neo6",
    label: "unWISE",
    detail: "Infrared · broad all-sky coverage",
  },
  { id: "ls-dr11", label: "DR11", detail: "Optical · newest Legacy Survey" },
  { id: "ls-dr10", label: "DR10", detail: "Optical · Legacy Survey DR10" },
  { id: "ls-dr9", label: "DR9", detail: "Optical · alternate Legacy Survey" },
] as const;

function cutoutUrl(ra: number, dec: number, fov: number, layer: string) {
  // Keep the whole requested field in view, within Legacy Survey's 512px limit.
  const pixscale = Math.max(0.262, Math.min(4, (fov * 3600) / 512));
  const params = new URLSearchParams({
    ra: String(ra),
    dec: String(dec),
    layer,
    pixscale: pixscale.toFixed(4),
    size: "512",
  });
  return `https://www.legacysurvey.org/viewer/jpeg-cutout?${params}`;
}

function viewerUrl(ra: number, dec: number, layer: string) {
  return `https://www.legacysurvey.org/viewer/?${new URLSearchParams({
    ra: String(ra),
    dec: String(dec),
    layer,
    zoom: "14",
  })}`;
}

export function SkyContextMap({
  ra,
  dec,
  fov,
}: {
  ra: number;
  dec: number;
  fov: number;
}) {
  const [layerIndex, setLayerIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const activeLayer = surveyLayers[layerIndex];
  const src = useMemo(
    () => cutoutUrl(ra, dec, fov, activeLayer.id),
    [ra, dec, fov, activeLayer.id],
  );
  const interactiveUrl = viewerUrl(ra, dec, activeLayer.id);

  const chooseLayer = (nextIndex: number) => {
    setLayerIndex(nextIndex);
    setAttempt((value) => value + 1);
    setState("loading");
  };

  const retry = () => {
    if (layerIndex < surveyLayers.length - 1) {
      chooseLayer(layerIndex + 1);
      return;
    }
    setAttempt((value) => value + 1);
    setState("loading");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-lilac/20 bg-panel shadow-[0_20px_60px_-35px_rgba(190,158,225,.75)]">
      <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="flex items-center gap-2 text-xs text-lilac">
            <Crosshair size={15} /> SKY CONTEXT
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[.1em] text-ink-faint">
            {activeLayer.detail}
          </p>
        </div>
        <a
          href={interactiveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-lilac/25 px-3 text-[11px] text-lilac transition-colors hover:bg-lilac/10"
        >
          Explore map <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/8 bg-panel-2/40 px-3 py-2 sm:px-4">
        {surveyLayers.map((layer, index) => (
          <Button
            key={layer.id}
            size="sm"
            variant="ghost"
            onPress={() => chooseLayer(index)}
            aria-pressed={layerIndex === index}
            className={`h-8 shrink-0 rounded-full px-3 text-[11px] ${layerIndex === index ? "bg-lilac/18 text-ink" : "text-ink-faint hover:bg-white/8 hover:text-ink"}`}
          >
            {layer.label}
          </Button>
        ))}
      </div>

      <div className="relative min-h-65 overflow-hidden bg-[#080911] sm:min-h-80 lg:min-h-95">
        <img
          key={`${activeLayer.id}-${attempt}`}
          src={src}
          alt={`${activeLayer.label} image centered at right ascension ${ra}°, declination ${dec}°`}
          data-testid="sky-context-map"
          className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${state === "error" ? "scale-105 opacity-0" : "opacity-100"}`}
          onLoad={() => setState("ready")}
          onError={() => {
            if (layerIndex < surveyLayers.length - 1)
              chooseLayer(layerIndex + 1);
            else setState("error");
          }}
        />
        {state === "ready" && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_48%,rgba(4,4,10,.5)_100%)]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lilac/80 shadow-[0_0_24px_rgba(207,176,224,.6)] after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-22 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-lilac/70 before:absolute before:left-1/2 before:top-1/2 before:h-22 before:w-px before:-translate-x-1/2 before:-translate-y-1/2 before:bg-lilac/70" />
            <a
              href={interactiveUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Explore this field in the interactive sky viewer"
              className="absolute inset-0"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/85 via-black/35 to-transparent px-4 pb-3 pt-14 font-mono text-[10px] tracking-[.08em] text-white/75 sm:px-5 sm:pb-4">
              <span>
                {activeLayer.label} · {fov}° FIELD
              </span>
              <span>CLICK TO EXPLORE</span>
            </div>
          </>
        )}
        {state === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080911] font-mono text-[11px] tracking-[.1em] text-ink-faint">
            <LoaderCircle size={19} className="animate-spin text-lilac" />
            LOADING {activeLayer.label.toUpperCase()} CONTEXT
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080911] px-6 text-center">
            <TriangleAlert size={20} className="text-[#d8bd9c]" />
            <p className="max-w-sm text-xs leading-5 text-ink-faint">
              No reference cutout could be loaded. Your SPHEREx frames are still
              available.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onPress={retry}
              className="text-xs"
            >
              <RefreshCw size={13} /> Retry survey
            </Button>
          </div>
        )}
      </div>
      <p className="border-t border-white/8 px-4 py-3 text-[11px] leading-5 text-ink-faint sm:px-5">
        Reference survey only, not SPHEREx. Switch layers when a field is
        sparse, saturated, or outside an optical release footprint.
      </p>
    </section>
  );
}
