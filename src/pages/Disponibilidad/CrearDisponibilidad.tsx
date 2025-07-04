import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useDocentes } from '../../hooks/useDocentes';
import { useFormDisponibilidad } from '../../hooks/useFormDisponibilidad';

export default function CrearDisponibilidad() {
  const { docentes } = useDocentes();
  const [docenteId, setDocenteId] = useState('');
  const {
    disponibilidad,
    setDisponibilidad,
    loading,
    error,
    handleSubmit,
  } = useFormDisponibilidad(docenteId);

  const agregarBloque = () => {
    setDisponibilidad([
      ...disponibilidad,
      { dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00' },
    ]);
  };

  const actualizarBloque = (index: number, campo: string, valor: string) => {
    const nuevaDisponibilidad = [...disponibilidad];
    nuevaDisponibilidad[index] = { ...nuevaDisponibilidad[index], [campo]: valor };
    setDisponibilidad(nuevaDisponibilidad);
  };

  const eliminarBloque = (index: number) => {
    const nuevaDisponibilidad = disponibilidad.filter((_, i) => i !== index);
    setDisponibilidad(nuevaDisponibilidad);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear Disponibilidad</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={(e) => handleSubmit(() => {}, e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Docente</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={docenteId}
              onChange={(e) => setDocenteId(e.target.value)}
              required
            >
              <option value="">-- Selecciona --</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>

          {disponibilidad.map((bloque, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <select
                  className="border px-2 py-1 rounded"
                  value={bloque.dia}
                  onChange={(e) => actualizarBloque(index, 'dia', e.target.value)}
                >
                  {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
                <input
                  type="time"
                  className="border px-2 py-1 rounded"
                  value={bloque.hora_inicio}
                  onChange={(e) => actualizarBloque(index, 'hora_inicio', e.target.value)}
                />
                <input
                  type="time"
                  className="border px-2 py-1 rounded"
                  value={bloque.hora_fin}
                  onChange={(e) => actualizarBloque(index, 'hora_fin', e.target.value)}
                />
              </div>
              <button
                type="button"
                className="text-red-600 text-sm"
                onClick={() => eliminarBloque(index)}
              >
                Eliminar bloque
              </button>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={agregarBloque}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
            >
              + Agregar bloque
            </button>
            <button
              type="submit"
              disabled={loading || disponibilidad.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
