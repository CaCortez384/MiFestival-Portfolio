import { useState, useContext, useEffect } from 'react';
// MODIFICADO: Importamos sendPasswordResetEmail
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import mflogo from "../assets/mflogo20.png";
import { Link } from "react-router-dom";
// MODIFICADO: Agregamos XMarkIcon para el modal
import { EnvelopeIcon, LockClosedIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- NUEVOS ESTADOS PARA RESET PASSWORD ---
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/inicio");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
       setError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
       console.error("Error de login:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setError('');
      setLoading(true);
      try {
          await signInWithPopup(auth, googleProvider);
      } catch (err) {
          if (err.code !== 'auth/popup-closed-by-user') {
              setError('Error al iniciar sesión con Google.');
          }
          console.error("Error Google Login:", err);
      } finally {
          setLoading(false);
      }
  };

  // --- NUEVA FUNCIÓN: ENVIAR CORREO DE RESET ---
  const handleResetPassword = async (e) => {
      e.preventDefault();
      if (!resetEmail) {
          setResetError("Por favor ingresa tu correo.");
          return;
      }
      setResetLoading(true);
      setResetError('');
      setResetMessage('');
      
      try {
          await sendPasswordResetEmail(auth, resetEmail);
          setResetMessage("¡Listo! Revisa tu bandeja de entrada (y spam) para restablecer tu contraseña.");
      } catch (error) {
          console.error(error);
          if (error.code === 'auth/user-not-found') {
              setResetError("No existe una cuenta con este correo.");
          } else if (error.code === 'auth/invalid-email') {
              setResetError("El correo no es válido.");
          } else {
              setResetError("Ocurrió un error. Inténtalo más tarde.");
          }
      } finally {
          setResetLoading(false);
      }
  };

  // Pre-llenar el email del modal si el usuario ya escribió algo en el login
  const openResetModal = () => {
      setResetEmail(email); 
      setShowResetModal(true);
      setResetError('');
      setResetMessage('');
  };

  return (
    // FONDO OSCURO + LUCES AMBIENTALES
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      
      {/* Blobs de luz de fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px]"></div>
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
          
          {/* Luz superior decorativa */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-[2px]"></div>

          <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Bienvenido de Vuelta</h1>
            <p className="text-sm text-gray-400">
              Inicia sesión para gestionar tus lineups.
            </p>
          </div>

          {/* Mensaje de Error Login */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-xl p-3 mb-6 text-center animate-pulse">
              {error}
            </div>
          )}

          {/* Formulario Login */}
          <form onSubmit={handleLogin} className="space-y-5">
             
             {/* Input Email */}
             <div>
               <label htmlFor="email-login" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Correo Electrónico</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                   <EnvelopeIcon className="h-5 w-5" />
                 </div>
                 <input
                   id="email-login"
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
                <label htmlFor="password-login" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <LockClosedIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="password-login"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                  />
                </div>
                
                {/* MODIFICADO: Enlace Olvidaste contraseña */}
                <div className="text-right mt-2">
                   <button 
                     type="button"
                     onClick={openResetModal}
                     className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition"
                   >
                     ¿Olvidaste tu contraseña?
                   </button>
                </div>
             </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-center bg-cyan-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 ${
                 loading
                   ? 'opacity-70 cursor-not-allowed'
                   : 'hover:bg-cyan-500 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
               }`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-xs text-gray-500 font-medium uppercase tracking-wider">O inicia con</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Botón Google */}
          <button
            onClick={handleGoogleLogin}
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

          {/* Enlace Registro */}
          <p className="text-sm text-center text-gray-400 mt-8">
            ¿Eres nuevo aquí?{' '}
            <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition">
              Crea una cuenta gratis
            </Link>
          </p>
        </div>
      </main>

      {/* --- MODAL DE RECUPERACIÓN DE CONTRASEÑA --- */}
      {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-fade-in-up">
                  
                  {/* Botón cerrar */}
                  <button 
                      onClick={() => setShowResetModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                  >
                      <XMarkIcon className="w-6 h-6" />
                  </button>

                  <h3 className="text-xl font-bold text-white mb-2">Recuperar Cuenta</h3>
                  <p className="text-gray-400 text-sm mb-6">
                      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </p>

                  {resetMessage ? (
                      <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-lg p-4 text-center mb-4">
                          {resetMessage}
                          <button 
                             onClick={() => setShowResetModal(false)}
                             className="block w-full mt-3 bg-green-600/20 hover:bg-green-600/40 text-white text-xs font-bold py-2 rounded transition"
                          >
                              Cerrar
                          </button>
                      </div>
                  ) : (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correo</label>
                              <input 
                                  type="email" 
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                                  placeholder="ejemplo@correo.com"
                                  required
                              />
                          </div>
                          
                          {resetError && (
                              <p className="text-red-400 text-xs text-center">{resetError}</p>
                          )}

                          <button 
                              type="submit"
                              disabled={resetLoading}
                              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20 disabled:opacity-50"
                          >
                              {resetLoading ? "Enviando..." : "Enviar Enlace"}
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="w-full py-6 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0B0F19]">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} MiFestival. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Login;