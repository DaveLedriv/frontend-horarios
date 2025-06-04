import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { usePlanesEstudio } from '../../hooks/usePlanesEstudio';
  import { Materia } from '../../types/Materia';

export default function EditarMateria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

const [materia, setMateria] = useState<Materia>({
  id: 0,
  nombre: '',
  codigo: '',
  tipo: 'OBLIGATORIA',
  creditos: 0,
  plan_estudio_id: 1,
});


const { planes, loading: loadingPlanes } = usePlanesEstudio();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/materias/${id}`);
        setMateria(res.data);
      } catch (err) {
        console.error('Error al cargar materia:', err);
        alert('No se pudo cargar la materia.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMateria((prev) => ({ ...prev, [name]: name === 'creditos' || name === 'plan_estudio_id' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/materias/${id}`, materia);
      alert('Materia actualizada correctamente');
      navigate('/materias');
    } catch (err) {
      console.error('Error al actualizar materia:', err);
      alert('Ocurrió un error al actualizar la materia.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Materia</h2>
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={materia.nombre}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
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
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                name="tipo"
                value={materia.tipo}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
              >
                <option value="">Selecciona una opción</option>
                <option value="OBLIGATORIA">Obligatoria</option>
                <option value="OPTATIVA">Optativa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Créditos</label>
              <input
                type="number"
                name="creditos"
                value={materia.creditos}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700">Plan de Estudio</label>
  <select
    name="plan_estudio_id"
    value={materia.plan_estudio_id}
    onChange={handleChange}
    className="w-full mt-1 px-4 py-2 border rounded-lg"
    disabled={loadingPlanes}
  >
    <option value="">Selecciona un plan</option>
    {planes.map((plan) => (
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
              Guardar cambios
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
