import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMaterias } from '../../hooks/useMaterias';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';

export default function ListaMaterias() {
  const { materias, loading, error, refetch } = useMaterias();
  const { showSuccess, showError } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const eliminarMateria = async (id: number) => {
    try {
      await api.delete(`/materias/${id}`);
      await refetch();
      showSuccess('Materia eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      showError('Ocurrió un error al eliminar la materia.');
    }
  };

  const handleEliminar = (id: number) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId !== null) {
      eliminarMateria(selectedId);
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Materias registradas</h2>
        <Link
          to="/materias/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nueva materia
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : materias.length === 0 ? (
        <EmptyState message="No hay materias registradas." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Créditos</th>
                <th className="px-4 py-2 text-left">Plan Estudio ID</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2">{m.codigo}</td>
                  <td className="px-4 py-2">{m.nombre}</td>
                  <td className="px-4 py-2">{m.tipo}</td>
                  <td className="px-4 py-2">{m.creditos}</td>
                  <td className="px-4 py-2">{m.plan_estudio_id}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/materias/editar/${m.id}`}
                      className="inline-block bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleEliminar(m.id)}
                      className="inline-block bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        isOpen={dialogOpen}
        title="Eliminar materia"
        message="¿Estás seguro de eliminar esta materia?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}
