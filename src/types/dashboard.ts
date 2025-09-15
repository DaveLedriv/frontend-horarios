export interface DashboardStats {
  totalUsers: number;
  totalDocentes: number;
  activeReservations: number;
  averageOccupancy: number;
  userGrowth?: number;
  docenteGrowth?: number;
  reservationGrowth?: number;
  occupancyGrowth?: number;
}

export interface CategoryDistributionDatum {
  label: string;
  value: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}
