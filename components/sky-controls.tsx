'use client'

import {
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  TextField,
} from '@heroui/react'
import { Minus, Plus } from 'lucide-react'

export const fieldClass =
  'h-11 w-full rounded-lg border border-white/12 bg-panel-2 px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint hover:border-white/20 focus:border-lilac/70 focus:ring-2 focus:ring-lilac/20'
const labelClass = 'text-xs font-medium text-ink-dim'

export function SkyTextField({
  label,
  value,
  onChange,
  placeholder,
  descriptionId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  descriptionId?: string
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
  )
}

export function SkySelect({
  label,
  value,
  onChange,
  options,
  compact = false,
  portalContainer,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string; description?: string }[]
  compact?: boolean
  portalContainer?: Element | null
}) {
  return (
    <Select
      aria-label={compact ? label : undefined}
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key))
      }}
      className={compact ? 'ml-2 w-32' : 'w-full gap-2'}
    >
      {!compact && <Label className={labelClass}>{label}</Label>}
      <Select.Trigger
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-white/12 bg-panel-2 px-3 text-left text-ink outline-none transition-colors hover:border-white/25 aria-expanded:border-lilac/60 data-focus-visible:border-lilac/70 data-focus-visible:ring-2 data-focus-visible:ring-lilac/25 ${compact ? 'h-10 font-mono text-xs' : 'h-11 text-sm'}`}
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
                <span className={compact ? 'font-mono text-xs' : 'text-sm'}>
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
  )
}

export function FieldOfView({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <NumberField
      value={value === '' ? NaN : Number(value)}
      onChange={(number) =>
        onChange(Number.isNaN(number) ? '' : String(number))
      }
      commitBehavior="validate"
      isRequired
      minValue={0}
      validate={(number) =>
        number > 0 ? null : 'Enter a field of view greater than zero.'
      }
      maxValue={0.5}
      step={10 ** -Math.max(2, Math.min(6, (value.split('.')[1] ?? '').length))}
      formatOptions={{ maximumFractionDigits: 6, useGrouping: false }}
      className="w-full gap-2"
    >
      <Label className={labelClass}>FIELD OF VIEW</Label>
      <NumberField.Group className="relative flex h-11 w-full items-center overflow-hidden rounded-lg border border-white/12 bg-panel-2 transition-colors hover:border-white/20 focus-within:border-lilac/70 focus-within:ring-2 focus-within:ring-lilac/20">
        <NumberField.DecrementButton
          aria-label="Decrease field of view"
          className="h-full w-11 text-lilac hover:bg-white/8"
        >
          <Minus size={15} />
        </NumberField.DecrementButton>
        <NumberField.Input className="min-w-0 bg-transparent text-center font-mono text-sm text-ink" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-14 text-xs text-ink-faint"
        >
          °
        </span>
        <NumberField.IncrementButton
          aria-label="Increase field of view"
          className="h-full w-11 text-lilac hover:bg-white/8"
        >
          <Plus size={15} />
        </NumberField.IncrementButton>
      </NumberField.Group>
      <Description className="text-xs text-ink-faint">
        Degrees · max 0.5° · precise decimal input
      </Description>
      <FieldError className="text-xs text-[#f2b6bd]" />
    </NumberField>
  )
}
