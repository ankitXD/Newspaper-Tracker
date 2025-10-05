export const DEFAULT_TZ = process.env.TIMEZONE || "Asia/Kolkata";

function _datePartsInTZ(timeZone = DEFAULT_TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const parts = fmt.formatToParts(now);
  const day = parts.find((p) => p.type === "day").value;
  const month = parts.find((p) => p.type === "month").value;
  const year = parts.find((p) => p.type === "year").value;
  return { day, month, year, monthIndex: Number(month) - 1 };
}

export function getTodayDate_DDMMYYYY() {
  const { day, month, year } = _datePartsInTZ();
  return `${day}-${month}-${year}`;
}

export function getCurrentDate_Readable() {
  const { day, monthIndex, year } = _datePartsInTZ();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[monthIndex]} ${year}`;
}

export function getCurrentTime_HHMMSS() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEFAULT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return fmt.format(now);
}
