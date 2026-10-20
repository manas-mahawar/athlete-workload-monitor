import type { ReactNode } from 'react'
import type { Tone } from '../lib/colors'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
    </div>
  )
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatTile({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {detail && <div className="mt-1 text-sm text-slate-600">{detail}</div>}
    </div>
  )
}

export function LoadingState() {
  return (
    <div role="status" className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      Loading data…
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm">
      <p className="font-semibold text-red-700">Could not load data</p>
      <p className="mt-1 text-slate-700">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
      >
        Reload page
      </button>
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700 ring-green-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

