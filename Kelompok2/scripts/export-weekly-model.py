"""Export frozen Ridge model + independent NumPy parity fixtures.
Usage: python scripts/export-weekly-model.py path/to/akta_2026.csv
Requires numpy. Raw source data and identities are never copied into the app.
"""
import csv
import hashlib
import json
import sys
from datetime import date, timedelta
from pathlib import Path
import numpy as np

source = Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest() == '6225dd33f2678f30b11ad3883ab2ecd670825ab1dd22bc9ebc3b7db5bffe2090', 'Source changed: repeat evaluation before exporting version v1.'
root = Path(__file__).resolve().parents[1]
rows = list(csv.DictReader(source.open(encoding='utf-8-sig', newline='')))
dates = [date.fromisoformat(row['tanggal_akta']) for row in rows]
weeks = [date(2026, 1, 5)+timedelta(weeks=i) for i in range(42)]
y = np.array([sum(w <= d < w+timedelta(days=7) for d in dates) for w in weeks], dtype=float)
assert len(rows) == 114 and y.sum() == 111
X = np.array([[y[t-j] for j in range(1, 5)] for t in range(4, len(y))])
target = y[4:]
mean, scale = X.mean(axis=0), X.std(axis=0)
scale[scale == 0] = 1
Z = (X-mean)/scale
alpha = 100
coef = np.linalg.solve(Z.T@Z+alpha*np.eye(4), Z.T@(target-target.mean()))
model = {
    'version': 'ridge-weekly-v1', 'trainedThrough': '2026-10-25',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'lags': 4, 'alpha': alpha, 'trainingPairs': len(target),
    'inputOrder': 'oldest-to-newest', 'coefficientOrder': 'newest-to-oldest',
    'mean': mean.tolist(), 'scale': scale.tolist(), 'weights': coef.tolist(),
    'intercept': float(target.mean()), 'maxObservedWeeklyCount': int(y.max()),
    'evaluation': {'kind': 'exploratory-rolling-refit-not-frozen-model', 'weeks': 8,
                   'modelMae': 3.6561702419239945, 'baselineMae': 1.625},
}
path = root/'src/assets/models/weekly-ridge.json'
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(model, indent=2)+'\n', encoding='utf-8')
# Synthetic inputs, including asymmetric ordering and out-of-training-range values.
fixtures = []
for values in ([0, 0, 0, 0], [1, 2, 3, 4], [4, 3, 2, 1], [11]*4, [100]*4):
    pred = max(0, float(target.mean()+((np.array(values[::-1])-mean)/scale)@coef))
    fixtures.append({'input': values, 'expected': pred})
(root/'scripts/weekly-model-fixtures.json').write_text(json.dumps(fixtures, indent=2)+'\n', encoding='utf-8')
print('Exported frozen model and 5 NumPy reference predictions; no source records copied.')
