import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import EmptyState from '../EmptyState';
import type { CategoryDistributionDatum } from '../../types/dashboard';

interface PopularTimesChartProps {
  data: CategoryDistributionDatum[];
  height?: number;
}

export default function PopularTimesChart({
  data,
  height = 320,
}: PopularTimesChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <EmptyState message="No hay información de horarios solicitados" />
      </div>
    );
  }

  const series = [
    {
      name: 'Reservas',
      data: data.map((item) => item.value),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 8,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: data.map((item) => item.label),
      title: { text: 'Horario' },
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: { text: 'Reservas' },
      min: 0,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter(value: number) {
          return `${value} reservas`;
        },
      },
    },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
}
