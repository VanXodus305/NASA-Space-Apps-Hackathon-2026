"use client";

import {
  Autocomplete,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  NumberField,
  SearchField,
  Select,
  TextField,
  useFilter,
} from "@heroui/react";
import { Minus, Plus } from "lucide-react";

export const fieldClass =
  "h-11 w-full rounded-lg border border-white/12 bg-panel-2 px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint hover:border-white/20 focus:border-lilac/70 focus:ring-2 focus:ring-lilac/20";
const labelClass = "text-xs font-medium text-ink-dim";

export function SkyTextField({
  label,
  value,
  onChange,
  placeholder,
  descriptionId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  descriptionId?: string;
}) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      className="min-w-0 gap-2"
      aria-describedby={descriptionId}
    >
      <Label className={labelClass}>{label}</Label>
      <Input className={fieldClass} placeholder={placeholder} />
    </TextField>
  );
}

export function TargetAutocomplete({
  value,
  onSelect,
  options,
}: {
  value: string;
  onSelect: (target: { name: string; ra: string; dec: string } | null) => void;
  options: readonly {
    id: string;
    name: string;
    tag: string;
    ra: string;
    dec: string;
  }[];
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  const selectedTarget = options.find((option) => option.name === value);
  const challengeOptions = options.filter((option) => Number(option.id) <= 5);
  const moreOptions = options.filter((option) => Number(option.id) > 5);
  const selectTarget = (key: string | number | null) => {
    const target = options.find((option) => option.id === String(key));
    onSelect(target ?? null);
  };
  return (
    <Autocomplete
      value={selectedTarget?.id ?? null}
      onChange={selectTarget}
      onClear={() => onSelect(null)}
      placeholder="Select or search a target"
      className="w-full gap-2"
    >
      <Label className={labelClass}>OBJECT NAME / TARGET</Label>
      <Autocomplete.Trigger className="flex h-11 w-full items-center rounded-lg border border-white/12 bg-panel-2 px-3 transition-colors hover:border-white/20 focus-within:border-lilac/70 focus-within:ring-2 focus-within:ring-lilac/20">
        <Autocomplete.Value className="min-w-0 flex-1 truncate text-left text-xs text-ink data-placeholder:text-ink-faint sm:text-sm">
          {({ isPlaceholder, defaultChildren, selectedText }) =>
            isPlaceholder ? defaultChildren : selectedText
          }
        </Autocomplete.Value>
        <Autocomplete.ClearButton className="mr-1 size-6 shrink-0 rounded-md text-ink-dim hover:bg-white/8 hover:text-ink" />
        <Autocomplete.Indicator className="!static ml-1 flex size-7 shrink-0 items-center justify-center rounded-md text-lilac hover:bg-white/8" />
      </Autocomplete.Trigger>
      <Autocomplete.Popover className="z-50 max-h-72 min-w-(--trigger-width) overflow-hidden rounded-lg border border-white/12 bg-panel p-1 shadow-xl shadow-black/50">
        <Autocomplete.Filter filter={contains}>
          <SearchField className="mb-1 p-1">
            <SearchField.Group className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-panel-2 px-3 focus-within:border-lilac/70 focus-within:ring-2 focus-within:ring-lilac/20">
              <SearchField.SearchIcon className="size-4 shrink-0 text-lilac" />
              <SearchField.Input
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
                placeholder="Search targets…"
              />
              <SearchField.ClearButton className="size-6 shrink-0 rounded text-ink-dim hover:bg-white/8 hover:text-ink" />
            </SearchField.Group>
          </SearchField>
          <ListBox className="max-h-60 overflow-y-auto outline-none">
            <ListBox.Section
              aria-label="Space Apps challenge examples"
              className="before:block before:px-3 before:pb-1 before:pt-2 before:font-mono before:text-[10px] before:tracking-[.13em] before:text-lilac before:content-['SPACE_APPS_CHALLENGE_EXAMPLES']"
            >
              {challengeOptions.map((option) => (
                <ListBox.Item
                  key={option.id}
                  id={option.id}
                  textValue={option.name}
                  className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-ink-dim outline-none transition-colors data-focused:bg-white/8 data-focused:text-ink"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink">
                      {option.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] tracking-[.06em] text-ink-faint">
                      {option.tag} · {option.ra}°, {option.dec}°
                    </span>
                  </span>
                  <ListBox.ItemIndicator className="shrink-0 text-lilac" />
                </ListBox.Item>
              ))}
            </ListBox.Section>
            {moreOptions.length > 0 && (
              <ListBox.Section
                aria-label="More targets"
                className="mt-1 border-t border-white/10 before:block before:px-3 before:pb-1 before:pt-3 before:font-mono before:text-[10px] before:tracking-[.13em] before:text-ink-dim before:content-['MORE_TARGETS']"
              >
                {moreOptions.map((option) => (
                  <ListBox.Item
                    key={option.id}
                    id={option.id}
                    textValue={option.name}
                    className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-ink-dim outline-none transition-colors data-focused:bg-white/8 data-focused:text-ink"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">
                        {option.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] tracking-[.06em] text-ink-faint">
                        {option.tag} · {option.ra}°, {option.dec}°
                      </span>
                    </span>
                    <ListBox.ItemIndicator className="shrink-0 text-lilac" />
                  </ListBox.Item>
                ))}
              </ListBox.Section>
            )}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

export function SkySelect({
  label,
  value,
  onChange,
  options,
  compact = false,
  portalContainer,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string; description?: string }[];
  compact?: boolean;
  portalContainer?: Element | null;
}) {
  return (
    <Select
      aria-label={compact ? label : undefined}
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key));
      }}
      className={compact ? "ml-2 w-32" : "w-full gap-2"}
    >
      {!compact && <Label className={labelClass}>{label}</Label>}
      <Select.Trigger
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-white/12 bg-panel-2 px-3 text-left text-ink outline-none transition-colors hover:border-white/25 aria-expanded:border-lilac/60 data-focus-visible:border-lilac/70 data-focus-visible:ring-2 data-focus-visible:ring-lilac/25 ${compact ? "h-10 font-mono text-xs" : "h-11 text-sm"}`}
      >
        <Select.Value className="min-w-0 flex-1 truncate text-left" />
        <Select.Indicator className="size-4 shrink-0 text-lilac" />
      </Select.Trigger>
      <Select.Popover
        UNSTABLE_portalContainer={portalContainer ?? undefined}
        className="z-50 min-w-(--trigger-width) overflow-hidden rounded-lg border border-white/12 bg-panel p-0 shadow-xl shadow-black/50"
      >
        <ListBox className="max-h-[inherit] overflow-y-auto p-1 outline-none">
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              aria-label={option.label}
              textValue={option.label}
              className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-ink-dim outline-none transition-colors data-focused:bg-white/8 data-focused:text-ink data-selected:text-ink"
            >
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className={compact ? "font-mono text-xs" : "text-sm"}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="mt-0.5 text-xs text-ink-faint">
                    {option.description}
                  </span>
                )}
              </span>
              <ListBox.ItemIndicator className="shrink-0 text-lilac" />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function FieldOfView({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <NumberField
      value={value === "" ? NaN : Number(value)}
      onChange={(number) =>
        onChange(Number.isNaN(number) ? "" : String(number))
      }
      commitBehavior="validate"
      isRequired
      minValue={0}
      validate={(number) =>
        number > 0 ? null : "Enter a field of view greater than zero."
      }
      maxValue={0.5}
      step={10 ** -Math.max(2, Math.min(6, (value.split(".")[1] ?? "").length))}
      formatOptions={{ maximumFractionDigits: 6, useGrouping: false }}
      className="w-full gap-2"
    >
      <Label className={labelClass}>FIELD OF VIEW</Label>
      <NumberField.Group className="relative grid h-11 w-full overflow-hidden rounded-lg border border-white/12 bg-panel-2 transition-colors hover:border-white/20 focus-within:border-lilac/70 focus-within:ring-2 focus-within:ring-lilac/20">
        <NumberField.DecrementButton
          aria-label="Decrease field of view"
          className="h-full !w-full text-lilac hover:bg-white/8"
        >
          <Minus size={15} />
        </NumberField.DecrementButton>
        <NumberField.Input className="min-w-0 pr-10 text-center font-mono text-sm text-ink" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-16 text-xs text-ink-faint"
        >
          °
        </span>
        <NumberField.IncrementButton
          aria-label="Increase field of view"
          className="h-full !w-full text-lilac hover:bg-white/8"
        >
          <Plus size={15} />
        </NumberField.IncrementButton>
      </NumberField.Group>
      <Description className="text-xs text-ink-faint">
        Degrees · max 0.5° · precise decimal input
      </Description>
      <FieldError className="text-xs text-[#f2b6bd]" />
    </NumberField>
  );
}
