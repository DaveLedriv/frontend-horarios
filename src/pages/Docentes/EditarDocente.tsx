import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useFacultades } from '../../hooks/useFacultades';
import { Facultad } from '../../types/Facultad';

export default function EditarDocente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [docente, setDocente] = useState({
    nombre: '',
    correo: '',
    numero_empleado: '',
    facultad_id: 1,
  });

  const { facultades, loading: loadingFacultades } = useFacultades();

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/docentes/${id}`);
        setDocente(res.data);
      } catch (err) {
        console.error('Error al obtener docente:', err);
        alert('No se pudo cargar el docente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocente();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDocente((prev) => ({ ...prev, [name]: name === 'facultad_id' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/docentes/${id}`, docente);
      alert('Docente actualizado correctamente');
      navigate('/docentes');
    } catch (err) {
      console.error('Error al actualizar docente:', err);
      alert('No se pudo actualizar el docente.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Docente</h2>
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={docente.nombre}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo</label>
              <input
                type="email"
                name="correo"
                value={docente.correo}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de empleado</label>
              <input
                type="text"
                name="numero_empleado"
                value={docente.numero_empleado}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Facultad</label>
              <select
                name="facultad_id"
                value={docente.facultad_id}
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
