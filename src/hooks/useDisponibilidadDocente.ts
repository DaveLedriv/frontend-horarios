import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export interface Disponibilidad {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export const useDisponibilidadDocente = (docenteId: string | null) => {
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docenteId) {
      setDisponibilidad([]);
      return;
    }

    const fetchDisponibilidad = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/docentes/${docenteId}/disponibilidad`);
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
