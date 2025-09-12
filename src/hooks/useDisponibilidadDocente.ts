import { useEffect, useState } from 'react';
import api from '../lib/api';
import { DisponibilidadDocente } from '../types/DisponibilidadDocente';

export const useDisponibilidadDocente = (docenteId: string | null) => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDocente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docenteId) {
      setDisponibilidad([]);
      return;
    }

    const fetchDisponibilidad = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/disponibilidad/docente/${docenteId}`);
        setDisponibilidad(res.data.disponibles || []);
      } catch (err) {
        console.error('Error al cargar disponibilidad:', err);
        setDisponibilidad([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibilidad();
  }, [docenteId]);

  return { disponibilidad, loading };
};
