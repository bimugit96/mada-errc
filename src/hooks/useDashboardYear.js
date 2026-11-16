import { useEffect, useState } from 'react';

const currentYear = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  timeZone: 'Asia/Kuala_Lumpur',
}).format(new Date());

async function readJson(url, signal) {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Data dashboard tidak dapat dimuatkan.');
  }
  return response.json();
}

export function defaultDashboardYear(years) {
  return years.includes(currentYear) ? currentYear : years[0] || '';
}

export function useDashboardYears(type) {
  const [years, setYears] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    readJson('/api/dashboard/' + type, controller.signal).then(setYears).catch((error) => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [type]);

  return { years: years || [], error, loading: !years && !error };
}

export default function useDashboardYear(type, availability, summaryYear) {
  const url = '/api/dashboard/' + type;
  const [selection, setSelection] = useState(null);
  const [result, setResult] = useState(null);
  const { years, error, loading } = availability;
  const year = summaryYear === undefined
    ? selection ?? defaultDashboardYear(years)
    : years.includes(summaryYear) ? summaryYear : '';

  useEffect(() => {
    if (!year) return;
    const controller = new AbortController();
    readJson(url + '/' + year, controller.signal).then((model) => {
      if (!controller.signal.aborted) setResult({ year, model });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ year, error: error.message });
    });
    return () => controller.abort();
  }, [url, year]);

  const selectedResult = result?.year === year ? result : null;
  return {
    years,
    year,
    setYear: setSelection,
    model: selectedResult?.model,
    error: selectedResult?.error || error,
    loading: (loading && selection !== '') || Boolean(year && !selectedResult),
  };
}
