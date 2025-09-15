import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
}

export default function ChartCard({
  title,
  description,
  children,
  isLoading = false,
}: ChartCardProps) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <header>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </header>
      <div className="mt-6 flex-1">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-32 animate-pulse rounded-full bg-gray-200" />
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
