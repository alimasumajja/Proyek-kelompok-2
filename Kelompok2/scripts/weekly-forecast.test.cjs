const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const metaPath = path.join(__dirname, '../src/assets/models/weekly-forecast-meta.json');
const tflitePath = path.join(__dirname, '../src/assets/models/weekly-forecast.tflite');
const metricsPath = path.join(__dirname, '../docs/project/metrics.json');
const fixturesPath = path.join(__dirname, './weekly-model-fixtures.json');

const modelMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
const source = fs.readFileSync(path.join(__dirname, '../src/utils/weekly-forecast.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

// Tanpa API jaringan/storage: preprocessing & fallback harus bekerja dari metadata lokal saja.
const sandbox = {
  exports: {},
  require: (id) => {
    assert.equal(id, '../assets/models/weekly-forecast-meta.json');
    return modelMeta;
  },
};
vm.runInNewContext(compiled, sandbox);
const {
  predictWeeklyDeeds,
  parseWeeklyCounts,
  preprocessWeeklyCounts,
  computeWeeklyBaselines,
  aggregateRecentFourFullWeeks,
} = sandbox.exports;

test('bundled .tflite file is a valid TFLite FlatBuffer matching metadata size', () => {
  assert.ok(fs.existsSync(tflitePath), 'weekly-forecast.tflite harus tersedia');
  const buf = fs.readFileSync(tflitePath);
  assert.equal(buf.length, modelMeta.tfliteSizeBytes);
  // TFLite FlatBuffer file identifier berada pada byte 4..8: "TFL3".
  assert.equal(buf.subarray(4, 8).toString('ascii'), 'TFL3');
});

test('offline JS preprocessing & fallback agree with TFLite Interpreter fixtures', () => {
  for (const fixture of fixtures) {
    const result = predictWeeklyDeeds(fixture.input);
    assert.ok(
      Math.abs(result.prediction - fixture.expected) < 1e-4,
      `Mismatch for ${JSON.stringify(fixture.input)}: got ${result.prediction}, expected ${fixture.expected}`,
    );
    assert.equal(result.baselines.naiveLag1, fixture.naiveBaseline);
    assert.equal(result.baselines.ma4, fixture.ma4Baseline);
  }
});

test('preprocessing produces Float32Array length 4 in newest-to-oldest order', () => {
  const tensor = preprocessWeeklyCounts([0, 1, 2, 3]);
  assert.equal(Object.prototype.toString.call(tensor), '[object Float32Array]');
  assert.equal(tensor.length, 4);
  for (let i = 0; i < 4; i += 1) {
    assert.ok(Number.isFinite(tensor[i]));
  }
});

test('blank, fractional, negative, infinite and malformed inputs are rejected', () => {
  for (const input of [
    [],
    [0, 1, 2],
    [0, 1, 2, -1],
    [0, 1, 2, 1.5],
    [0, 1, 2, Infinity],
    [0, 1, 2, NaN],
    [0, 1, 2, 10001],
  ]) {
    assert.throws(() => predictWeeklyDeeds(input));
  }
  for (const value of ['', ' ', '-1', '2.5', '1e2', 'abc', '10001']) {
    assert.throws(() => parseWeeklyCounts(['1', '2', '3', value]));
  }
  assert.deepEqual(Array.from(parseWeeklyCounts(['0', ' 2 ', '3', '4'])), [0, 2, 3, 4]);
  const baselines = computeWeeklyBaselines([1, 2, 3, 4]);
  assert.equal(baselines.naiveLag1, 4);
  assert.equal(baselines.ma4, 2.5);
});

test('out-of-training-range inputs are flagged without mislabelling zero', () => {
  assert.equal(predictWeeklyDeeds([0, 0, 0, 0]).outsideTrainingRange, false);
  assert.equal(
    predictWeeklyDeeds([1, 2, 3, modelMeta.maxObservedWeeklyCount + 1]).outsideTrainingRange,
    true,
  );
});

test('metrics.json contains chronological split, baselines, quantization, and zero PII flag', () => {
  assert.ok(fs.existsSync(metricsPath), 'docs/project/metrics.json harus tersedia');
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  assert.equal(metrics.generatedFrom.piiStoredInArtifacts, false);
  assert.equal(metrics.chronologicalSplit.train.pairs, 22);
  assert.equal(metrics.chronologicalSplit.validation.pairs, 8);
  assert.equal(metrics.chronologicalSplit.testHoldout.pairs, 8);
  assert.ok(metrics.primaryTaskRegularDeeds.testHoldoutFinalBundledModel.tfliteBundledModel.mae > 0);
  assert.ok(metrics.tfliteExportAndQuantization.variants.fp32.sizeBytes > 0);
});

test('aggregateRecentFourFullWeeks counts only regular deeds across 4 full Mon-Sun weeks', () => {
  // Referensi Rabu 25 Nov 2026 -> Senin minggu ini 23 Nov 2026.
  // 4 minggu penuh: [26 Okt-1 Nov], [2 Nov-8 Nov], [9 Nov-15 Nov], [16 Nov-22 Nov].
  const ref = new Date(2026, 10, 25);
  const sample = [
    { tanggal: '25-10-2026', jenis: 'Pendirian PT' }, // sebelum jendela (diabaikan)
    { tanggal: '26-10-2026', jenis: 'Pendirian PT' }, // minggu 1
    { tanggal: '03-11-2026', jenis: 'Pernyataan Keputusan Sirkuler Pemegang Saham' }, // minggu 2
    { tanggal: '04-11-2026', jenis: 'Personal Guarantee' }, // batch PG (dipisahkan)
    { tanggal: '2026-11-12', jenis: 'Pendirian CV' }, // minggu 3 (ISO)
    { tanggal: '19-11-2026', jenis: 'Pendirian PT' }, // minggu 4
    { tanggal: '22-11-2026', jenis: 'Akta Jual Beli' }, // minggu 4 (Minggu)
    { tanggal: '23-11-2026', jenis: 'Pendirian PT' }, // minggu berjalan belum penuh (diabaikan)
  ];
  const agg = aggregateRecentFourFullWeeks(sample, ref);
  assert.deepEqual(Array.from(agg.counts), [1, 1, 1, 2]);
  assert.equal(agg.totalRegularDeeds, 5);
  assert.equal(agg.excludedBatchPg, 1);
  assert.equal(agg.weekRanges.length, 4);
});
