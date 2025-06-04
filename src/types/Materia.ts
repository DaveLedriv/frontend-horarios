export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  tipo: 'OBLIGATORIA' | 'OPTATIVA';
  creditos: number;
  plan_estudio_id: number;
}
