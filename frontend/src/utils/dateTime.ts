// ==========================================================
// FORMAT TANGGAL & WAKTU KASIR AI
// ==========================================================
//
// Standar aplikasi:
// - Bahasa Indonesia
// - Timezone: Asia/Jakarta
// - Tampilan: WIB
//
// Database dan backend Anda sudah terbukti menggunakan WIB.
// File ini khusus untuk memastikan tampilan frontend konsisten.
// ==========================================================

const TIME_ZONE = "Asia/Jakarta";
const LOCALE = "id-ID";


// ==========================================================
// PARSE DATE
// ==========================================================

function parseDate(
  value: string | Date | number | null | undefined,
): Date | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


// ==========================================================
// FORMAT TANGGAL + WAKTU LENGKAP
// ==========================================================
//
// Contoh:
// 29 Agustus 2026, 02:07:08 WIB
// ==========================================================

export function formatDateTime(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  const formatted =
    new Intl.DateTimeFormat(
      LOCALE,
      {
        timeZone: TIME_ZONE,
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      },
    ).format(date);

  return `${formatted} WIB`;
}


// ==========================================================
// FORMAT TANGGAL SAJA
// ==========================================================
//
// Contoh:
// 29 Agustus 2026
// ==========================================================

export function formatDate(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    LOCALE,
    {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}


// ==========================================================
// FORMAT TANGGAL PENDEK
// ==========================================================
//
// Contoh:
// 29/08/2026
// ==========================================================

export function formatDateShort(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    LOCALE,
    {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}


// ==========================================================
// FORMAT WAKTU
// ==========================================================
//
// Contoh:
// 02:07:08
// ==========================================================

export function formatTime(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    LOCALE,
    {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  ).format(date);
}


// ==========================================================
// FORMAT WAKTU SINGKAT
// ==========================================================
//
// Contoh:
// 02:07
// ==========================================================

export function formatTimeShort(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    LOCALE,
    {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(date);
}


// ==========================================================
// FORMAT LOG
// ==========================================================
//
// Contoh:
// 29/08/2026 02:07:08 WIB
// ==========================================================

export function formatDateTimeLog(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  const formatted =
    new Intl.DateTimeFormat(
      LOCALE,
      {
        timeZone: TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      },
    ).format(date);

  return `${formatted} WIB`;
}


// ==========================================================
// FORMAT ISO UNTUK INPUT DATETIME-LOCAL
// ==========================================================
//
// Contoh output:
// 2026-08-29T02:07
//
// Dipakai bila frontend membutuhkan nilai
// untuk input type="datetime-local".
// ==========================================================

export function formatDateTimeLocal(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    ).formatToParts(date);

  const get = (type: string) =>
    parts.find(
      (part) =>
        part.type === type,
    )?.value ?? "";

  return (
    `${get("year")}-${get("month")}-${get("day")}` +
    `T${get("hour")}:${get("minute")}`
  );
}


// ==========================================================
// FORMAT "HARI INI"
// ==========================================================
//
// Contoh:
// Hari ini, 02:07
// ==========================================================

export function formatTodayTime(
  value: string | Date | number | null | undefined,
): string {
  const date = parseDate(value);

  if (!date) {
    return "-";
  }

  const now = new Date();

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    );

  const valueDate =
    formatter.format(date);

  const todayDate =
    formatter.format(now);

  if (valueDate === todayDate) {
    return `Hari ini, ${formatTimeShort(date)}`;
  }

  return formatDateTime(date);
}


// ==========================================================
// EXPORT TIMEZONE
// ==========================================================

export {
  TIME_ZONE,
  LOCALE,
};