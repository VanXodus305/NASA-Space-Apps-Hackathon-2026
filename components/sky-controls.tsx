"use client";

import {
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  TextField,
} from "@heroui/react";
import { Minus, Plus } from "lucide-react";

export const fieldClass =
  "h-11 w-full rounded-xl border border-white/12 bg-[#0c0c17] px-3 text-sm text-[#e6ddec] outline-none transition focus:border-[#b796d2] focus:ring-2 focus:ring-[#b796d2]/20";
const labelClass = "text-[11px] font-medium text-[#b1a5bd]";

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
      className={compact ? "ml-2 w-28" : "w-full gap-2"}
    >
      {!compact && <Label className={labelClass}>{label}</Label>}
      <Select.Trigger
        className={
          compact
            ? "relative flex h-10 w-full items-center justify-center rounded-lg border border-white/15 bg-[#15111f] px-7 py-0 text-center font-mono text-[10px] text-[#d8c6e5]"
            : `${fieldClass} relative flex items-center justify-center px-10 py-0 text-center hover:border-[#cbb0df]/50 data-focus-visible:ring-2 data-focus-visible:ring-[#b796d2]/40`
        }
      >
        <Select.Value className="flex min-w-0 flex-1 items-center justify-center truncate text-center leading-none" />
        <Select.Indicator className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5a6db]" />
      </Select.Trigger>
      <Select.Popover
        UNSTABLE_portalContainer={portalContainer ?? undefined}
        className="z-50 min-w-(--trigger-width) rounded-2xl border border-[#c7a3dd]/25 bg-[#171120] p-1.5 shadow-[0_16px_60px_#0009]"
      >
        <ListBox className="outline-none">
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              aria-label={option.label}
              textValue={option.label}
              className="gap-2 rounded-xl px-8 py-3 text-[#dac8e6] data-focused:bg-[#35223f] data-selected:bg-[#b99ccc]/15"
            >
              <div className="flex-1 text-center">
                <Label className="mx-auto block text-xs text-inherit">
                  {option.label}
                </Label>
                {option.description && (
                  <Description className="mt-1 block text-[10px] text-[#a695b6]">
                    {option.description}
                  </Description>
                )}
              </div>
              <ListBox.ItemIndicator className="text-[#d5b0ed]" />
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
      <NumberField.Group className="relative h-12 w-full rounded-xl border border-white/12 bg-[#0c0c17] focus-within:border-[#b796d2] focus-within:ring-2 focus-within:ring-[#b796d2]/20">
        <NumberField.DecrementButton
          aria-label="Decrease field of view"
          className="h-full w-11 text-[#c9a9df] hover:bg-[#b99ccc]/10"
        >
          <Minus size={15} />
        </NumberField.DecrementButton>
        <NumberField.Input className="min-w-0 bg-transparent text-center font-mono text-sm text-[#e6ddec]" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-14 text-xs text-[#94839f]"
        >
          °
        </span>
        <NumberField.IncrementButton
          aria-label="Increase field of view"
          className="h-full w-11 text-[#c9a9df] hover:bg-[#b99ccc]/10"
        >
          <Plus size={15} />
        </NumberField.IncrementButton>
      </NumberField.Group>
      <Description className="text-[10px] text-[#94839f]">
        Degrees · max 0.5° · precise decimal input
      </Description>
      <FieldError className="text-xs text-[#f2b6bd]" />
    </NumberField>
  );
}
