import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import apiClient from '../../services/apiClient';
import { useFacultades } from '../../hooks/useFacultades';
import { Facultad } from '../../types/Facultad';

export default function CrearPlanEstudio() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState({
    nombre: '',
    facultad_id: 1,
  });

  const { facultades, loading: loadingFacultades } = useFacultades();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlan((prev) => ({ ...prev, [name]: name === 'facultad_id' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/planes-estudio', plan);
      alert('Plan de estudio creado exitosamente');
      navigate('/planes-estudio');
    } catch (err) {
      console.error('Error al crear plan de estudio:', err);
      alert('No se pudo registrar el plan de estudio.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar Plan de Estudio</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={plan.nombre}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Facultad</label>
            <select
              name="facultad_id"
              value={plan.facultad_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              disabled={loadingFacultades}
              required
            >
              <option value="">Selecciona una facultad</option>
              {facultades.map((facultad: Facultad) => (
                <option key={facultad.id} value={facultad.id}>
                  {facultad.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Registrar
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
