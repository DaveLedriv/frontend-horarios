import { useState } from 'react';
import axios from 'axios';
import { Disponibilidad } from '../hooks/useDisponibilidadDocente';

export const useFormDisponibilidad = (docenteId: string) => {
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // En caso de que se agreguen campos generales
  };

  const handleSubmit = async (onSuccess: () => void, e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/disponibilidad`, {
        docente_id: Number(docenteId),
        disponibles: disponibilidad,
      });
      onSuccess();
      setDisponibilidad([]);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  return {
    disponibilidad,
    setDisponibilidad,
    loading,
    error,
    handleChange,
    handleSubmit,
  };
};
