import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- Importa el AuthProvider
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateFestival from './pages/CreateFestival';
import Inicio from './pages/Inicio';
import MisFestivales from './pages/MisFestivales';
import Festival from './pages/Festival';
import EditarFestival from './pages/EditarFestival';
import VerFestival from './pages/VerFestival';
import Mantenimiento from './pages/Mantenimiento';
import Explorar from './pages/Explorar';
import Restablecer from './pages/Restablecer';
import Perfil from './pages/Perfil';

function App() {
  const isMaintenance = String(import.meta.env.VITE_MAINTENANCE || '').toLowerCase() === 'true';

  if (isMaintenance) {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="*" element={<Mantenimiento />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<div className="p-4">Página no encontrada</div>} />
          <Route path="/crear-festival" element={<CreateFestival />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/mis-festivales" element={<MisFestivales />} />
          <Route path="/festival/:id" element={<Festival />} />
          <Route path="/verfestival/:slugId" element={<VerFestival />} />
          <Route path="/festival/:id/artistas" element={<Festival />} />
          <Route path="/editarFestival/:id" element={<EditarFestival />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/restablecer" element={<Restablecer />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;