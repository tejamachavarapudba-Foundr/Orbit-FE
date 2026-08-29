export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const MONTH_OPTIONS = MONTH_LABELS.map((label, index) => ({
  label: label.slice(0, 3),
  value: String(index + 1).padStart(2, "0")
}));

export const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  const years: { label: string; value: string }[] = [];
  for (let year = currentYear; year >= currentYear - 60; year -= 1) {
    years.push({ label: String(year), value: String(year) });
  }
  return years;
})();

/** Formats a "YYYY-MM" value as LinkedIn does — e.g. "2022-01" -> "Jan 2022". */
export const formatMonthYear = (value: string): string => {
  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;
  const label = MONTH_LABELS[monthIndex];
  if (!year || !label) return "";
  return `${label.slice(0, 3)} ${year}`;
};

export type WorkExperience = {
  company: string;
  designation: string;
  location: string;
  startDate: string; // "YYYY-MM"
  endDate: string; // "YYYY-MM", blank when isCurrent
  isCurrent: boolean;
  /** Free-text timeline from before the date-picker existed — kept only as
   * a display fallback for entries that predate startDate/endDate; never
   * written by the edit form. */
  legacyTimeline?: string;
};

/** LinkedIn-style "Jan 2022 - Present" / "Jan 2022 - Mar 2023". Falls back to
 * the old free-text timeline for entries saved before this format existed. */
export const formatExperienceTimeline = (entry: WorkExperience): string => {
  const start = formatMonthYear(entry.startDate);
  if (!start) return entry.legacyTimeline ?? "";
  const end = entry.isCurrent ? "Present" : formatMonthYear(entry.endDate);
  return end ? `${start} - ${end}` : start;
};

export type Certification = {
  name: string;
  fileUrl: string;
  fileKey: string;
};

export const emptyWorkExperience = (): WorkExperience => ({
  company: "",
  designation: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false
});

/** A single job stint used only to compute total experience — no company/
 * designation, just the date range (see ExperiencePeriodsEditor). */
export type ExperiencePeriod = {
  startDate: string; // "YYYY-MM"
  endDate: string; // "YYYY-MM", blank when isCurrent
  isCurrent: boolean;
};

export const emptyExperiencePeriod = (): ExperiencePeriod => ({
  startDate: "",
  endDate: "",
  isCurrent: false
});

const currentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const toAbsoluteMonth = (value: string): number | null => {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return year * 12 + (month - 1);
};

const periodToRange = (period: ExperiencePeriod): [number, number] | null => {
  const start = toAbsoluteMonth(period.startDate);
  const end = toAbsoluteMonth(period.isCurrent ? currentYearMonth() : period.endDate);
  if (start === null || end === null || end < start) return null;
  return [start, end];
};

/** Sums each period's length, but merges overlapping/back-dated ranges
 * first so a stint that overlaps another is never double-counted. */
export const calculateTotalExperienceMonths = (periods: ExperiencePeriod[]): number => {
  const ranges = periods
    .map(periodToRange)
    .filter((range): range is [number, number] => range !== null)
    .sort((a, b) => a[0] - b[0]);

  const first = ranges[0];
  if (!first) return 0;

  let total = 0;
  let [mergedStart, mergedEnd] = first;
  for (const [start, end] of ranges.slice(1)) {
    if (start <= mergedEnd) {
      mergedEnd = Math.max(mergedEnd, end);
    } else {
      total += mergedEnd - mergedStart;
      [mergedStart, mergedEnd] = [start, end];
    }
  }
  total += mergedEnd - mergedStart;
  return total;
};

/** Indices of periods whose date range overlaps another period's — used to
 * flag "back-dated"/overlapping entries in the editor so they can be fixed. */
export const findOverlappingPeriodIndices = (periods: ExperiencePeriod[]): Set<number> => {
  const ranges = periods.map(periodToRange);
  const overlapping = new Set<number>();

  for (let i = 0; i < ranges.length; i += 1) {
    for (let j = i + 1; j < ranges.length; j += 1) {
      const a = ranges[i];
      const b = ranges[j];
      if (!a || !b) continue;
      if (a[0] <= b[1] && b[0] <= a[1]) {
        overlapping.add(i);
        overlapping.add(j);
      }
    }
  }

  return overlapping;
};

export const formatTotalExperience = (totalMonths: number): string => {
  if (totalMonths <= 0) return "";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years && months) return `${years} yr${years > 1 ? "s" : ""} ${months} mo${months > 1 ? "s" : ""}`;
  if (years) return `${years} yr${years > 1 ? "s" : ""}`;
  return `${months} mo${months > 1 ? "s" : ""}`;
};

/** Total experience across all periods, formatted as "3 yrs 4 mos" — used
 * everywhere experience is displayed, so only the total ever shows, never
 * the individual date ranges. */
export const calculateTotalExperienceLabel = (periods: ExperiencePeriod[]): string =>
  formatTotalExperience(calculateTotalExperienceMonths(periods));

export const emptyCertification = (): Certification => ({
  name: "",
  fileUrl: "",
  fileKey: ""
});
