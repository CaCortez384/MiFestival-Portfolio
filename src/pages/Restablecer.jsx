import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import mflogo from "../assets/mflogo20.png";
import { LockClosedIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Restablecer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Firebase envía el código en el parámetro 'oobCode'
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(true);

  // Validar el código al cargar la página
  useEffect(() => {
    const checkCode = async () => {
        if (!oobCode) {
            setIsCodeValid(false);
            return;
        }
        try {
            // Verificamos si el código es válido antes de mostrar el formulario
            await verifyPasswordResetCode(auth, oobCode);
        } catch (err) {
            console.error(err);
            setIsCodeValid(false);
        }
    };
    checkCode();
  }, [oobCode]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000); // Redirigir tras 3 segundos
    } catch (err) {
      console.error(err);
      setError("El enlace ha expirado o ya fue usado. Solicita uno nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI: ESTILO DARK NEON ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white font-sans relative overflow-hidden p-4">
      
      {/* Luces de fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative">
        
        <div className="text-center mb-8">
            <img src={mflogo} alt="Logo" className="w-12 h-12 mx-auto mb-4 rounded-lg" />
            <h1 className="text-2xl font-bold text-white mb-2">Nueva Contraseña</h1>
        </div>

        {/* CASO 1: CÓDIGO INVÁLIDO */}
        {!isCodeValid ? (
            <div className="text-center">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 border border-red-500/20">
                    <XCircleIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>El enlace es inválido o ha expirado.</p>
                </div>
                <Link to="/login" className="text-cyan-400 hover:underline font-bold">Volver al Login</Link>
            </div>
        ) : success ? (
            /* CASO 2: ÉXITO */
            <div className="text-center animate-fade-in-up">
                <div className="bg-green-500/10 text-green-400 p-6 rounded-xl mb-6 border border-green-500/20">
                    <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">¡Contraseña Actualizada!</h3>
                    <p className="text-sm opacity-80">Serás redirigido al login en unos segundos...</p>
                </div>
                <button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-white text-[#0B0F19] font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                >
                    Ir al Login Ahora
                </button>
            </div>
        ) : (
            /* CASO 3: FORMULARIO DE CAMBIO */
            <form onSubmit={handleReset} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Nueva Contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <LockClosedIcon className="h-5 w-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default Restablecer;