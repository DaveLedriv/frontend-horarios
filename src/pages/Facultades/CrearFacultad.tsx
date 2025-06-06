import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function CrearFacultad() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/facultades`, { nombre });
      alert('Facultad creada exitosamente');
      navigate('/facultades');
    } catch (err) {
      console.error('Error al crear facultad:', err);
      alert('No se pudo registrar la facultad.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrar Facultad</h2>
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
            Registrar
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
