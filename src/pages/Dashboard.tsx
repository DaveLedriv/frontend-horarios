import DashboardLayout from '../layouts/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Bienvenido al Panel Administrativo</h1>
      <p className="text-gray-700 mb-4">
        Desde aquí puedes gestionar materias, docentes, horarios y más.
      </p>
      <p className="text-sm text-gray-500">
        Usa el menú lateral para navegar entre módulos.
      </p>
    </DashboardLayout>
  );
}
