interface KpiCardProps {
  title: string;
  value: number | null;
  formatter?: (value: number | null) => string;
  trend?: number | null;
  trendLabel?: string;
  isLoading?: boolean;
}

const defaultFormatter = (value: number | null) => {
  if (value === null) {
    return '—';
  }

  return new Intl.NumberFormat('es-ES').format(value);
};

export default function KpiCard({
  title,
  value,
  formatter = defaultFormatter,
  trend,
  trendLabel,
  isLoading = false,
}: KpiCardProps) {
  const trendColor = trend !== undefined && trend !== null
    ? trend >= 0
      ? 'text-emerald-600'
      : 'text-rose-600'
    : 'text-gray-400';

  const trendSymbol = trend !== undefined && trend !== null
    ? trend >= 0
      ? '▲'
      : '▼'
    : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-3 flex items-baseline gap-2">
        {isLoading ? (
          <span className="h-8 w-24 animate-pulse rounded bg-gray-200" aria-label="Cargando" />
        ) : (
          <span className="text-3xl font-semibold text-gray-900">{formatter(value)}</span>
        )}
      </div>
      {trendSymbol && trend !== null && trend !== undefined && (
        <p className={`mt-3 flex items-center gap-2 text-sm font-medium ${trendColor}`}>
          <span aria-hidden>{trendSymbol}</span>
          <span>
            {Math.abs(trend).toFixed(1)}%
            {trendLabel ? ` · ${trendLabel}` : ''}
          </span>
        </p>
      )}
    </div>
  );
}
