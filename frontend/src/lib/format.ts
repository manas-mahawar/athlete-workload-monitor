const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse "YYYY-MM-DD" as a calendar date (no timezone shift). */
function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

/** "2026-10-01" -> "1 Oct 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const { y, m, d } = parts(iso)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** "2026-10-01" -> "1 Oct" (for chart axes) */
export function formatShortDate(iso: string): string {
  const { m, d } = parts(iso)
  return `${d} ${MONTHS[m - 1]}`
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export function daysBetween(fromIso: string, toIso: string): number {
  const a = parts(fromIso)
  const b = parts(toIso)
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)
  return Math.round(ms / MILLISECONDS_PER_DAY)
}

/** Today's local calendar date as "YYYY-MM-DD". */
export function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function ageOn(dobIso: string, refIso: string): number {
  const dob = parts(dobIso)
  const ref = parts(refIso)
  let age = ref.y - dob.y
  if (ref.m < dob.m || (ref.m === dob.m && ref.d < dob.d)) age -= 1
  return age
}

const integer = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
// Always two decimals so ratios read consistently (1.10, not 1.1)
const decimal = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatNumber(value: number | null | undefined, digits: 0 | 2 = 0): string {
  if (value === null || value === undefined) return '—'
  return (digits === 0 ? integer : decimal).format(value)
}

/** Where an ACWR sits relative to the sport's safe range. */
export function acwrZone(value: number, low: number, high: number): 'below' | 'within' | 'above' {
  if (value < low) return 'below'
  if (value > high) return 'above'
  return 'within'
}
