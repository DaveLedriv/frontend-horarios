import { useEffect, useState } from 'react';
import api from '../lib/api';
import { DisponibilidadDocente } from '../types/DisponibilidadDocente';

export const useDisponibilidadDocente = (docenteId: string | null) => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDocente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!docenteId) {
      setDisponibilidad([]);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchDisponibilidad = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/disponibilidad/docente/${docenteId}`);
        if (!isMounted) return;
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.disponibles || [];
        setDisponibilidad(data);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error al cargar disponibilidad:', err);
        setDisponibilidad([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDisponibilidad();

    return () => {
      isMounted = false;
    };
  }, [docenteId]);

  return { disponibilidad, loading };
};
