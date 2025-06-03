import DashboardLayout from '../../layouts/DashboardLayout';
import MateriaForm from '../../components/Materias/MateriaForm';

export default function CrearMateria() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Crear Materia</h1>
      <MateriaForm onSuccess={() => alert('Materia creada con éxito')} />
    </DashboardLayout>
  );
}
