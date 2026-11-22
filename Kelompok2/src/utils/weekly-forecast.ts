import model from '../assets/models/weekly-ridge.json';

export const weeklyModelInfo = model;

/** Input is chronological: oldest week first, most recent week last. */
export function predictWeeklyDeeds(counts: readonly number[]) {
  if (counts.length !== 4 || counts.some((n) => !Number.isSafeInteger(n) || n < 0 || n > 10000)) {
    throw new Error('Isi empat minggu dengan bilangan bulat 0–10.000.');
  }
  const newestFirst = [...counts].reverse();
  const prediction = model.intercept + newestFirst.reduce(
    (sum, value, i) => sum + ((value - model.mean[i]) / model.scale[i]) * model.weights[i], 0,
  );
  if (!Number.isFinite(prediction)) throw new Error('Model tidak dapat menghitung prediksi.');
  return {
    prediction: Math.max(0, prediction),
    baseline: counts[3],
    outsideTrainingRange: counts.some((n) => n > model.maxObservedWeeklyCount),
  };
}

/** Reject empty values rather than treating unknown weeks as zero. */
export function parseWeeklyCounts(values: readonly string[]) {
  if (values.length !== 4 || values.some((v) => !/^\d{1,5}$/.test(v.trim()))) {
    throw new Error('Lengkapi empat minggu dengan angka bulat. Isi 0 hanya jika tidak ada akta.');
  }
  const counts = values.map((v) => Number(v.trim()));
  predictWeeklyDeeds(counts);
  return counts;
}
