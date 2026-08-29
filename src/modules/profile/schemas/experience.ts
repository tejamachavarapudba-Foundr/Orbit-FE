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

const monthsBetween = (start: string, end: string): number => {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  if (!startYear || !startMonth || !endYear || !endMonth) return 0;
  return Math.max(0, (endYear - startYear) * 12 + (endMonth - startMonth));
};

export const calculateTotalExperienceMonths = (periods: ExperiencePeriod[]): number =>
  periods.reduce((sum, period) => {
    const end = period.isCurrent ? currentYearMonth() : period.endDate;
    return sum + monthsBetween(period.startDate, end);
  }, 0);

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
