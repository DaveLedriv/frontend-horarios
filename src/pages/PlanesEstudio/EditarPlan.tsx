import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useFacultades } from '../../hooks/useFacultades';
import { Facultad } from '../../types/Facultad';

export default function EditarPlanEstudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState({
    nombre: '',
    facultad_id: 1,
  });

  const { facultades, loading: loadingFacultades } = useFacultades();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/planes-estudio/${id}`);
        setPlan(res.data);
      } catch (err) {
        console.error('Error al cargar plan:', err);
        alert('No se pudo cargar el plan de estudio.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlan((prev) => ({
      ...prev,
      [name]: name === 'facultad_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/planes-estudio/${id}`, plan);
      alert('Plan de estudio actualizado correctamente');
      navigate('/planes-estudio');
    } catch (err) {
      console.error('Error al actualizar el plan:', err);
      alert('No se pudo actualizar el plan de estudio.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Plan de Estudio</h2>
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
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
              Guardar cambios
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
