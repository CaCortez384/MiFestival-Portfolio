import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import mflogo from "../assets/mflogo20.png";
import { Link } from "react-router-dom";
// Iconos para darle un toque visual a los inputs
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

// Icono de Google (Mantenemos el SVG original)
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nombre });
      navigate('/inicio');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
      console.error("Error de registro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/inicio');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
          setError('Error al registrar con Google. Inténtalo de nuevo.');
      }
      console.error("Error Google Register:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    // FONDO OSCURO + LUCES AMBIENTALES
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      
      {/* Blobs de luz de fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="w-full px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                <img src={mflogo} alt="MiFestival Logo" className="relative w-9 h-9 rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">MiFestival</span>
          </Link>
          
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      {/* --- MAIN CARD --- */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-16 relative z-10">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative">
          
          {/* Luz superior decorativa en la tarjeta */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-[2px]"></div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Únete al Backstage</h1>
            <p className="text-sm text-gray-400">
              Crea tu cuenta gratis y empieza a diseñar.
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-xl p-3 mb-6 text-center animate-pulse">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleRegister} id='register-form' className="space-y-5">
            
            {/* Input Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Nombre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                />
              </div>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-center bg-cyan-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-cyan-500 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
              }`}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-xs text-gray-500 font-medium uppercase tracking-wider">O regístrate con</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Botón Google (Estilo White/Clean para contraste) */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 bg-white text-gray-900 rounded-xl py-3 px-4 text-sm font-bold shadow-lg transition duration-200 transform hover:-translate-y-0.5 ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-gray-100'
            }`}
            type="button"
          >
            <GoogleIcon />
            Google
          </button>

          {/* Link Login */}
          <p className="text-sm text-center text-gray-400 mt-8">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full py-6 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0B0F19]">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} MiFestival. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Register;