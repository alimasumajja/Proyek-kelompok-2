const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const model = require('../src/assets/models/weekly-ridge.json');
const fixtures = require('./weekly-model-fixtures.json');
const source = fs.readFileSync(path.join(__dirname, '../src/utils/weekly-forecast.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
} }).outputText;
// No fetch/network/storage APIs: inference must succeed using the bundled model alone.
const sandbox = { exports: {}, require: (id) => {
  assert.equal(id, '../assets/models/weekly-ridge.json');
  return model;
} };
vm.runInNewContext(compiled, sandbox);
const { predictWeeklyDeeds, parseWeeklyCounts } = sandbox.exports;
test('offline JS inference agrees with independent NumPy training pipeline', () => {
  for (const fixture of fixtures) {
    const result = predictWeeklyDeeds(fixture.input);
    assert.ok(Math.abs(result.prediction - fixture.expected) < 1e-10);
    assert.equal(result.baseline, fixture.input[3]);
  }
});
test('blank, fractional, negative, infinite and malformed inputs are rejected', () => {
  for (const input of [[], [0, 1, 2], [0, 1, 2, -1], [0, 1, 2, 1.5], [0, 1, 2, Infinity], [0, 1, 2, NaN], [0, 1, 2, 10001]]) {
    assert.throws(() => predictWeeklyDeeds(input));
  }
  for (const value of ['', ' ', '-1', '2.5', '1e2', 'abc', '10001']) {
    assert.throws(() => parseWeeklyCounts(['1', '2', '3', value]));
  }
  assert.deepEqual(Array.from(parseWeeklyCounts(['0', ' 2 ', '3', '4'])), [0, 2, 3, 4]);
});
test('out-of-training-range inputs are flagged without mislabelling zero', () => {
  assert.equal(predictWeeklyDeeds([0, 0, 0, 0]).outsideTrainingRange, false);
  assert.equal(predictWeeklyDeeds([1, 2, 3, 12]).outsideTrainingRange, true);
});
