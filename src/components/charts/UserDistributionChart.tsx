import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import EmptyState from '../EmptyState';
import type { CategoryDistributionDatum } from '../../types/dashboard';

interface UserDistributionChartProps {
  data: CategoryDistributionDatum[];
  height?: number;
}

export default function UserDistributionChart({
  data,
  height = 320,
}: UserDistributionChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <EmptyState message="No hay datos de distribución disponibles" />
      </div>
    );
  }

  const series = data.map((item) => item.value);
  const labels = data.map((item) => item.label);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
    },
    labels,
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      formatter(value) {
        return `${value.toFixed(1)}%`;
      },
    },
    stroke: {
      colors: ['transparent'],
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return <Chart options={options} series={series} type="donut" height={height} />;
}
