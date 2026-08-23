const MINIMUM_BIRTHDATE = "1900-01-01";

export function isValidOptionalBirthdate(
  value: string,
  today: Date = new Date(),
) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    return false;
  }

  const maximumBirthdate = [
    today.getFullYear().toString().padStart(4, "0"),
    (today.getMonth() + 1).toString().padStart(2, "0"),
    today.getDate().toString().padStart(2, "0"),
  ].join("-");

  return value >= MINIMUM_BIRTHDATE && value <= maximumBirthdate;
}
