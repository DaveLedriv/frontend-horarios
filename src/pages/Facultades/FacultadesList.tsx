import { Link } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { useFacultades } from '../../hooks/useFacultades';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';


export default function FacultadesList() {
  const { facultades, loading, refetch } = useFacultades();
  const { showSuccess, showError } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const eliminar = async (id: number) => {
    try {
      await api.delete(`/facultades/${id}`);
      await refetch();
      showSuccess('Facultad eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar facultad:', error);
      showError('No se pudo eliminar la facultad.');
    }
  };

  const handleEliminar = (id: number) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedId !== null) {
      eliminar(selectedId);
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Facultades registradas</h2>
        <Link
          to="/facultades/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nueva facultad
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : facultades.length === 0 ? (
        <EmptyState message="No hay facultades registradas." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facultades.map((facultad) => (
                <tr key={facultad.id} className="border-t">
                  <td className="px-4 py-2">{facultad.nombre}</td>
                  <td className="px-4 py-2">{facultad.descripcion}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/facultades/editar/${facultad.id}`}
                      className="inline-block bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleEliminar(facultad.id)}
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
        title="Eliminar facultad"
        message="¿Estás seguro de eliminar esta facultad?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}
