import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import EmptyState from '../EmptyState';
import type { TrendPoint } from '../../types/dashboard';

interface ReservationTrendsChartProps {
  data: TrendPoint[];
  height?: number;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

export default function ReservationTrendsChart({
  data,
  height = 320,
}: ReservationTrendsChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <EmptyState message="No hay tendencias registradas" />
      </div>
    );
  }

  const series = [
    {
      name: 'Reservas',
      data: data.map((item) => ({ x: item.date, y: item.value })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      type: 'category',
      tickPlacement: 'on',
      labels: {
        rotate: -45,
        formatter(value) {
          return formatDateLabel(String(value));
        },
      },
    },
    yaxis: {
      min: 0,
      labels: {
        formatter(value) {
          return `${Math.round(value)}`;
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    tooltip: {
      x: {
        formatter(value: string) {
          return formatDateLabel(value);
        },
      },
      y: {
        formatter(value: number) {
          return `${value} reservas`;
        },
      },
    },
  };

  return <Chart options={options} series={series} type="area" height={height} />;
}
