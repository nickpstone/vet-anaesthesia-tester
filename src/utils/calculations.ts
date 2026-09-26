import { PointEvaluation, RunEvaluation, OverallEvaluation, TestRun, ToleranceConfig } from '../types';

/**
 * Calculates allowable min and max for a given dial setting based on tolerance config.
 * In ISO 8835-4 / ASTM F1161 standards for anaesthetic vaporisers:
 * Allowable error is typically +/- 15% of the set dial concentration,
 * OR +/- 0.15% to 0.20% absolute concentration (whichever is greater),
 * to account for lower dial settings (like 0.2% and 0.6%) where 15% is smaller than instrument accuracy.
 */
export function calculateAllowableRange(
  dialSetting: number,
  config: ToleranceConfig
): { min: number; max: number; toleranceDelta: number } {
  let delta: number;

  if (config.mode === 'iso') {
    const relativeDelta = dialSetting * (config.percentage / 100);
    // Whichever is greater: relative percentage or absolute floor
    delta = Math.max(config.absoluteFloor, relativeDelta);
  } else if (config.mode === 'relative') {
    delta = dialSetting * (config.percentage / 100);
  } else {
    // Custom: uses user defined percentage with floor
    const relativeDelta = dialSetting * (config.percentage / 100);
    delta = Math.max(config.absoluteFloor, relativeDelta);
  }

  // Round delta to 3 decimal places
  delta = Math.round(delta * 1000) / 1000;
  const min = Math.max(0, Math.round((dialSetting - delta) * 1000) / 1000);
  const max = Math.round((dialSetting + delta) * 1000) / 1000;

  return { min, max, toleranceDelta: delta };
}

/**
 * Evaluates a single dial point measurement
 */
export function evaluatePoint(
  dialSetting: number,
  measured: number | undefined | null,
  config: ToleranceConfig
): PointEvaluation {
  const { min, max } = calculateAllowableRange(dialSetting, config);

  if (measured === undefined || measured === null || isNaN(measured)) {
    return {
      dialSetting,
      measured: null,
      minAllowable: min,
      maxAllowable: max,
      deviation: null,
      deviationPercent: null,
      status: 'PENDING'
    };
  }

  const deviation = Math.round((measured - dialSetting) * 1000) / 1000;
  const deviationPercent = dialSetting !== 0 
    ? Math.round(((measured - dialSetting) / dialSetting) * 10000) / 100 
    : 0;

  // Check if within bounds (inclusive with small epsilon for floating point accuracy)
  const isPassed = measured >= (min - 0.0001) && measured <= (max + 0.0001);

  let reason = '';
  if (!isPassed) {
    if (measured < min) {
      reason = `Below min (${min.toFixed(2)}%) by ${Math.abs(min - measured).toFixed(2)}%`;
    } else {
      reason = `Exceeds max (${max.toFixed(2)}%) by ${(measured - max).toFixed(2)}%`;
    }
  }

  return {
    dialSetting,
    measured,
    minAllowable: min,
    maxAllowable: max,
    deviation,
    deviationPercent,
    status: isPassed ? 'PASS' : 'FAIL',
    reason: isPassed ? undefined : reason
  };
}

/**
 * Evaluates an entire test run (e.g. at 1.0 L/min)
 */
export function evaluateRun(run: TestRun, config: ToleranceConfig): RunEvaluation {
  const evaluations: PointEvaluation[] = run.dialPoints.map((point) =>
    evaluatePoint(point.dialSetting, point.measured, config)
  );

  const filledPoints = evaluations.filter((p) => p.status !== 'PENDING');
  const hasMeasurements = filledPoints.length > 0;
  const hasFailures = evaluations.some((p) => p.status === 'FAIL');

  return {
    runId: run.id,
    flowrate: run.flowrate,
    carrierGas: run.carrierGas,
    evaluations,
    isPassed: hasMeasurements && !hasFailures,
    hasMeasurements
  };
}

/**
 * Evaluates all runs and returns the overall system status
 */
export function evaluateOverall(runs: TestRun[], config: ToleranceConfig): OverallEvaluation {
  const runEvals = runs.map((run) => evaluateRun(run, config));

  let totalFailed = 0;
  let totalPassed = 0;
  let totalPending = 0;
  let hasAnyMeasurement = false;

  for (const r of runEvals) {
    if (r.hasMeasurements) {
      hasAnyMeasurement = true;
    }
    for (const p of r.evaluations) {
      if (p.status === 'FAIL') totalFailed++;
      else if (p.status === 'PASS') totalPassed++;
      else totalPending++;
    }
  }

  const isPassed = hasAnyMeasurement && totalFailed === 0;

  let summaryMessage = '';
  if (!hasAnyMeasurement) {
    summaryMessage = 'Awaiting measured gas concentrations.';
  } else if (totalFailed > 0) {
    summaryMessage = `CALIBRATION FAILED: ${totalFailed} test point(s) exceed allowable ISO tolerance (±${config.percentage}% / floor ±${config.absoluteFloor}%). Immediate service or recalibration required.`;
  } else if (totalPending > 0) {
    summaryMessage = `In-progress: ${totalPassed} point(s) passed, ${totalPending} pending.`;
  } else {
    summaryMessage = `CALIBRATION PASSED: All ${totalPassed} test points are within allowable ISO tolerance limits.`;
  }

  return {
    isPassed,
    hasMeasurements: hasAnyMeasurement,
    failedCount: totalFailed,
    passedCount: totalPassed,
    pendingCount: totalPending,
    runs: runEvals,
    summaryMessage
  };
}
