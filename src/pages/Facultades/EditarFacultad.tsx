import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function EditarFacultad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultad = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/facultades/${id}`);
        setNombre(res.data.nombre);
      } catch (err) {
        console.error('Error al obtener facultad:', err);
        alert('No se pudo cargar la facultad.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacultad();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/facultades/${id}`, { nombre });
      alert('Facultad actualizada exitosamente');
      navigate('/facultades');
    } catch (err) {
      console.error('Error al actualizar facultad:', err);
      alert('No se pudo actualizar la facultad.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Facultad</h2>
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                required
              />
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
