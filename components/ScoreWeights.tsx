'use client';

import type { ScoreWeights as SW } from '@/lib/types';

export type ScoreWeights = SW;

interface ScoreWeightsSliderProps {
  weights: SW;
  onChange: (weights: SW) => void;
}

const LABELS: Record<keyof SW, string> = {
  devrank: 'DevRank',
  stars: 'Stars',
  activity: 'Activity',
  followers: 'Followers',
};

function normalize(w: SW): SW {
  const sum = w.devrank + w.stars + w.activity + w.followers;
  if (sum === 0) return { devrank: 0.25, stars: 0.25, activity: 0.25, followers: 0.25 };
  return {
    devrank: w.devrank / sum,
    stars: w.stars / sum,
    activity: w.activity / sum,
    followers: w.followers / sum,
  };
}

export function ScoreWeightsSlider({ weights, onChange }: ScoreWeightsSliderProps) {
  const update = (key: keyof SW, value: number) => {
    const next = { ...weights, [key]: Math.max(0, Math.min(1, value)) };
    onChange(normalize(next));
  };

  return (
    <div className="card sticky-sidebar">
      <h4 className="section-title" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>
        Ranking weights
      </h4>
      <div className="stack stack--md">
        {(Object.keys(LABELS) as Array<keyof SW>).map((key) => (
          <div key={key} className="cluster" style={{ alignItems: 'center', gap: 'var(--space-3)' }}>
            <label className="text-muted shrink-0" style={{ width: '5rem', fontSize: '0.75rem', fontWeight: 500 }}>
              {LABELS[key]}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={weights[key]}
              onChange={(e) => update(key, parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span className="text-muted" style={{ width: '2.5rem', textAlign: 'right', fontSize: '0.75rem', tabSize: 'numeric' }}>
              {(weights[key] * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
