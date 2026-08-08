const GOOGLE_ANALYTICS_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function resolveGoogleAnalyticsMeasurementId(
  value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
) {
  const measurementId = value?.trim();

  return measurementId &&
    GOOGLE_ANALYTICS_MEASUREMENT_ID_PATTERN.test(measurementId)
    ? measurementId
    : null;
}
