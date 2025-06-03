import { useState } from 'react';
import axios from 'axios';

interface Props {
  onSuccess: () => void;
}

export default function MateriaForm({ onSuccess }: Props) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [creditos, setCreditos] = useState('');
  const [tipo, setTipo] = useState('');
  const [planEstudioId, setPlanEstudioId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/materias`, {
        nombre,
        codigo,
        creditos: Number(creditos),
        tipo,
        plan_estudio_id: Number(planEstudioId),
      });

      setNombre('');
      setCodigo('');
      setCreditos('');
      setTipo('');
      setPlanEstudioId('');
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al registrar la materia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold">Registrar nueva materia</h2>

      <div>
        <label className="block text-sm mb-1">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Código</label>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Créditos</label>
        <input
          type="number"
          value={creditos}
          onChange={(e) => setCreditos(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Tipo</label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">ID del Plan de Estudio</label>
        <input
          type="number"
          value={planEstudioId}
          onChange={(e) => setPlanEstudioId(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrar materia'}
      </button>
    </form>
  );
}
