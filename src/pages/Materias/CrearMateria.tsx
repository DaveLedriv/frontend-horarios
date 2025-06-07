import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { usePlanesEstudio } from '../../hooks/usePlanesEstudio';
import { PlanEstudio } from '../../types/PlanEstudio';

export default function CrearMateria() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preloadedPlanId = searchParams.get('plan');

  const [materia, setMateria] = useState({
    nombre: '',
    codigo: '',
    tipo: '',
    creditos: 0,
    plan_estudio_id: preloadedPlanId ? Number(preloadedPlanId) : 1,
  });

  const { planes, loading: loadingPlanes } = usePlanesEstudio();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMateria((prev) => ({ ...prev, [name]: name === 'plan_estudio_id' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/materias`, materia);
      alert('Materia creada exitosamente');
      if (preloadedPlanId) {
        navigate(`/planes-estudio/${preloadedPlanId}/materias`);
      } else {
        navigate('/materias');
      }
    } catch (err) {
      console.error('Error al crear materia:', err);
      alert('No se pudo registrar la materia.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar Materia</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={materia.nombre}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código</label>
            <input
              type="text"
              name="codigo"
              value={materia.codigo}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <input
              type="text"
              name="tipo"
              value={materia.tipo}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Créditos</label>
            <input
              type="number"
              name="creditos"
              value={materia.creditos}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan de estudio</label>
            <select
              name="plan_estudio_id"
              value={materia.plan_estudio_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              disabled={loadingPlanes || !!preloadedPlanId}
              required
            >
              <option value="">Selecciona un plan</option>
              {planes.map((plan: PlanEstudio) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre}
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
