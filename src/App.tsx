import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';
import CrearMateria from './pages/Materias/CrearMateria';
import ListaMaterias from './pages/Materias/ListaMaterias';
import EditarMateria from './pages/Materias/EditarMateria';
import DocentesList from './pages/Docentes/DocentesList';
import EditarDocente from './pages/Docentes/EditarDocente';
import CrearDocente from './pages/Docentes/CrearDocente';
import FacultadesList from './pages/Facultades/FacultadesList';
import CrearFacultad from './pages/Facultades/CrearFacultad';
import EditarFacultad from './pages/Facultades/EditarFacultad';
import CrearPlanEstudio from './pages/PlanesEstudio/CrearPlan';
import PlanesEstudioList from './pages/PlanesEstudio/PlanesEstudioList';
import EditarPlanEstudio from './pages/PlanesEstudio/EditarPlan';
import MateriasPorPlan from './pages/PlanesEstudio/MateriasPorPlan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/materias" element={<ListaMaterias />} />
          <Route path="/materias/crear" element={<CrearMateria />} />
          <Route path="/materias/editar/:id" element={<EditarMateria />} />
          <Route path="/docentes" element={<DocentesList />} />
          <Route path="/docentes/editar/:id" element={<EditarDocente />} />
          <Route path="/docentes/crear" element={<CrearDocente />} />
          <Route path="/facultades" element={<FacultadesList />} />
          <Route path="/facultades/crear" element={<CrearFacultad />} />
          <Route path="/facultades/editar/:id" element={<EditarFacultad />} />
          <Route path="/planes-estudio" element={<PlanesEstudioList />} />
          <Route path="/planes-estudio/crear" element={<CrearPlanEstudio />} />
          <Route path="/planes-estudio/editar/:id" element={<EditarPlanEstudio />} />
          <Route path="/planes-estudio/:id/materias" element={<MateriasPorPlan />} />


        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
