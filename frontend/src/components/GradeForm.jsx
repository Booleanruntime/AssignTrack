import { useState } from 'react';

// mirrors the backend GradingStrategy so we can preview the label live. backend
// still recomputes it from the rubric on submit - this is display only.
const previewLabel = (overall, scheme) => {
  if (scheme === 'passfail') return overall >= 50 ? 'Pass' : 'Fail';
  if (scheme === 'letter') {
    if (overall >= 85) return 'HD';
    if (overall >= 75) return 'D';
    if (overall >= 65) return 'C';
    if (overall >= 50) return 'P';
    return 'F';
  }
  return `${overall}%`;
};

// the form a teacher fills in to grade one task. the rubric drives everything:
// the overall is sum(marks)/sum(out-of), and the scheme only decides how that
// overall reads. strengths/improvements are entered one per line.
const GradeForm = ({ task, onSubmit, onCancel }) => {
  const [scheme, setScheme] = useState('percentage');
  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [rubric, setRubric] = useState([{ criterion: '', score: '', outOf: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const updateRubric = (index, field, value) => {
    setRubric((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  // same maths as the backend's computeOverall, so the preview matches the result
  const totalMax = rubric.reduce((sum, r) => sum + (Number(r.outOf) || 0), 0);
  const totalMark = rubric.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
  const overall = totalMax > 0 ? Math.max(0, Math.min(100, Math.round((totalMark / totalMax) * 100))) : null;

  const lines = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (overall === null) {
      alert('Add at least one rubric row with a positive out-of mark.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        taskId: task._id,
        scheme,
        summary,
        strengths: lines(strengths),
        improvements: lines(improvements),
        rubric: rubric
          .filter((r) => r.criterion && Number(r.outOf) > 0)
          .map((r) => ({ criterion: r.criterion, score: Number(r.score) || 0, outOf: Number(r.outOf) })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none';

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col gap-md">
      <div>
        <h3 className="font-title-lg text-title-lg text-on-surface">Grade: {task.title}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          {task.user?.name} · {task.subject?.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-md items-end">
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant">Overall (from rubric)</label>
          <div className="mt-xs px-md py-sm bg-surface-container-high border border-outline-variant rounded-lg font-title-lg text-title-lg text-primary">
            {overall === null ? '—' : `${overall} / 100 · ${previewLabel(overall, scheme)}`}
          </div>
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant">Scheme</label>
          <select value={scheme} onChange={(e) => setScheme(e.target.value)} className={inputClass}>
            <option value="percentage">Percentage</option>
            <option value="letter">Letter grade</option>
            <option value="passfail">Pass / Fail</option>
          </select>
        </div>
      </div>

      <div>
        <label className="font-label-sm text-label-sm text-on-surface-variant">Rubric</label>
        <div className="flex gap-sm mt-xs font-label-sm text-label-sm text-on-surface-variant px-xs">
          <span className="flex-1">Criterion</span>
          <span className="w-20 text-center">Mark</span>
          <span className="w-20 text-center">Out of</span>
        </div>
        {rubric.map((row, i) => (
          <div key={i} className="flex gap-sm mt-xs">
            <input
              type="text"
              placeholder="e.g. Analysis"
              value={row.criterion}
              onChange={(e) => updateRubric(i, 'criterion', e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              placeholder="0"
              value={row.score}
              onChange={(e) => updateRubric(i, 'score', e.target.value)}
              className="w-20 px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface text-center focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              type="number"
              min="1"
              placeholder="10"
              value={row.outOf}
              onChange={(e) => updateRubric(i, 'outOf', e.target.value)}
              className="w-20 px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface text-center focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRubric([...rubric, { criterion: '', score: '', outOf: '' }])}
          className="mt-xs font-label-sm text-label-sm text-primary hover:underline"
        >
          + Add criterion
        </button>
      </div>

      <div>
        <label className="font-label-sm text-label-sm text-on-surface-variant">Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={inputClass} placeholder="Overall comment" />
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant">Strengths (one per line)</label>
          <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={3} className={inputClass} />
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant">Improvements (one per line)</label>
          <textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end gap-sm">
        <button type="button" onClick={onCancel} className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-md py-xs rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50">
          {submitting ? 'Saving...' : 'Submit Grade'}
        </button>
      </div>
    </form>
  );
};

export default GradeForm;
