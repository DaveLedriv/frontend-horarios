// src/pages/asignaciones/CrearAsignacion.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useDocentes } from '../../hooks/useDocentes';
import { useMateriasPorPlan } from '../../hooks/useMateriasPorPlan';
import { usePlanesEstudio } from '../../hooks/usePlanesEstudio';
import { Docente } from '../../types/Docente';
import { Materia } from '../../types/Materia';
import { PlanEstudio } from '../../types/PlanEstudio';

export default function CrearAsignacion() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const planId = searchParams.get('plan');

  const isValidPlan = planId && !isNaN(Number(planId));

  const { docentes, loading: loadingDocentes } = useDocentes();
  const { planes, loading: loadingPlanes } = usePlanesEstudio();
  const { materias, loading: loadingMaterias } = useMateriasPorPlan(isValidPlan ? planId : '');

  const [form, setForm] = useState({
    docente_id: '',
    materia_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/asignaciones`, {
        docente_id: Number(form.docente_id),
        materia_id: Number(form.materia_id),
      });
      alert('Asignación creada correctamente');
      navigate(-1);
    } catch (error) {
      console.error('Error al crear asignación', error);
      alert('No se pudo crear la asignación.');
    }
  };

  if (!isValidPlan) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-10">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Selecciona un plan de estudio:
          </label>
          <select
            onChange={(e) => {
              const selected = e.target.value;
              if (selected) {
                setSearchParams({ plan: selected });
              }
            }}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={loadingPlanes}
          >
            <option value="">-- Selecciona un plan --</option>
            {planes.map((plan: PlanEstudio) => (
              <option key={plan.id} value={plan.id}>{plan.nombre}</option>
            ))}
          </select>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Asignar materia a docente</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Docente</label>
            <select
              name="docente_id"
              value={form.docente_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              disabled={loadingDocentes}
              required
            >
              <option value="">Selecciona un docente</option>
              {docentes.map((d: Docente) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Materia</label>
            <select
              name="materia_id"
              value={form.materia_id}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              disabled={loadingMaterias}
              required
            >
              <option value="">Selecciona una materia</option>
              {materias.map((m: Materia) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Asignar
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
