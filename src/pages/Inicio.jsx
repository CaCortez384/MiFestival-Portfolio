import { useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import mflogo from "../assets/mflogo20.png";
import { AuthContext } from "../context/AuthContext";
// Iconos
import { 
  PlusCircleIcon, 
  ListBulletIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  FireIcon,
  GlobeAltIcon, // Nuevo icono para el banner
  HeartIcon // Nuevo icono para el banner
} from '@heroicons/react/24/outline';

const quickActions = [
  {
    title: "Crear Nuevo Festival",
    desc: "Empieza a diseñar tu próximo evento.",
    icon: <PlusCircleIcon className="w-10 h-10 text-cyan-400 mb-3 group-hover:scale-110 transition-transform duration-300" />,
    href: "/crear-festival",
    disabled: false,
    colorClass: "hover:border-cyan-500/50 hover:bg-cyan-500/10"
  },
  {
    title: "Mis Festivales",
    desc: "Ver y editar tus creaciones guardadas.",
    icon: <ListBulletIcon className="w-10 h-10 text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300" />,
    href: "/mis-festivales",
    disabled: false,
    colorClass: "hover:border-purple-500/50 hover:bg-purple-500/10"
  },
  {
    title: "Explorar",
    desc: "Descubre festivales de la comunidad.",
    icon: <GlobeAltIcon className="w-10 h-10 text-orange-400 mb-3 group-hover:scale-110 transition-transform duration-300" />,
    href: "/explorar",
    disabled: false,
    colorClass: "hover:border-orange-500/50 hover:bg-orange-500/10"
  },
  {
    title: "Mi Perfil",
    desc: "Estadísticas y ajustes de cuenta.",
    icon: <UserCircleIcon className="w-10 h-10 text-gray-500 mb-3" />,
    href: "/perfil",
    disabled: false, // <--- ¡Habilítalo!
    colorClass: "hover:border-gray-500/50 hover:bg-gray-500/10"
  }
];

const inspirationIdeas = [
    { title: "Indie Sunset", gradient: "from-orange-400 to-pink-600", tag: "Playa" },
    { title: "Neon Cyberpunk", gradient: "from-cyan-400 to-blue-800", tag: "Ciudad" },
    { title: "Desert Dust", gradient: "from-yellow-400 to-orange-700", tag: "Desierto" },
];

const Inicio = () => {
  const { user, setUser } = useContext(AuthContext);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <p className="text-gray-400 animate-pulse">Cargando...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/home" replace />;

  const handleLogout = async () => {
    try {
        if (user.isGuest) {
            setUser(null);
        } else {
            await auth.signOut();
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      
      {/* Luces de fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-cyan-900/10 rounded-full blur-[100px]"></div>
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-6xl">
        
        {/* Bienvenida + CTA Texto */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{user.displayName || "Usuario"}</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl">
              El escenario es tuyo. Diseña, publica y descubre nueva música.
            </p>
          </div>
          <Link to="/crear-festival" className="hidden md:flex items-center gap-2 bg-white text-[#0B0F19] px-6 py-3 rounded-full font-bold hover:bg-cyan-400 transition shadow-lg shadow-white/5">
            <SparklesIcon className="w-5 h-5" />
            Nuevo Proyecto
          </Link>
        </div>

        {/* Aviso Invitado */}
        {user.isGuest && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm rounded-xl p-4 mb-10 flex items-start gap-4 animate-fade-in-up">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400 shrink-0">
               <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-yellow-400 text-sm mb-1">Modo Invitado Activo</h4>
              <p className="text-yellow-200/80 text-sm">
                Tus festivales no se guardarán si cierras el navegador. <Link to="/register" className="text-white font-bold underline hover:text-cyan-400 transition">Regístrate gratis</Link> para guardarlos.
              </p>
            </div>
          </div>
        )}

        {/* --- NUEVO BANNER: LANZAMIENTO COMUNIDAD --- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            {/* Efecto de brillo de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <SparklesIcon className="w-3 h-3" /> Novedad
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Llegó la Comunidad MiFestival!</h2>
                <p className="text-indigo-200/80 text-sm leading-relaxed max-w-lg">
                    Ahora puedes hacer tus festivales <strong>públicos</strong>. Comparte tus lineups en el muro de "Explorar", recibe likes de otros usuarios y compite por estar en el <strong>Top Trending</strong>.
                </p>
                <div className="flex gap-4 mt-4 text-xs font-semibold text-indigo-300">
                    <span className="flex items-center gap-1"><GlobeAltIcon className="w-4 h-4"/> Publica tu cartel</span>
                    <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4"/> Recibe Likes</span>
                    <span className="flex items-center gap-1"><FireIcon className="w-4 h-4"/> Entra al Ranking</span>
                </div>
            </div>

            <Link to="/explorar" className="relative z-10 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-900/30 transition transform hover:-translate-y-0.5">
                Explorar Feed →
            </Link>
        </div>

        {/* --- SECTION 1: ACCIONES PRINCIPALES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.disabled ? '#' : action.href}
              className={`
                group relative block bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-300 ease-in-out overflow-hidden
                ${action.disabled
                  ? 'opacity-50 cursor-not-allowed grayscale'
                  : `hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/20 ${action.colorClass}`
                }
              `}
              onClick={(e) => action.disabled && e.preventDefault()}
            >
              {!action.disabled && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
              )}
              <div className="relative z-10">
                  {action.icon}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{action.title}</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* --- SECTION 2: INSPIRACIÓN VISUAL --- */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <FireIcon className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-white">Inspiración Trending</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {inspirationIdeas.map((item, idx) => (
                    <Link to="/crear-festival" key={idx} className="group relative aspect-[3/4] md:aspect-video lg:aspect-[3/2] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 hover:-translate-y-1">
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1 border border-white/20 px-2 py-1 rounded-md w-fit backdrop-blur-sm">{item.tag}</span>
                            <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                            <p className="text-sm text-white/80 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Usar este estilo →
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* --- SECTION 3: PRO TIPS --- */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-purple-500/20 p-4 rounded-xl shrink-0">
                    <SparklesIcon className="w-8 h-8 text-purple-300" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-3">¿Cómo hacer que tu cartel sea viral?</h3>
                    <ul className="space-y-3 text-gray-400 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-cyan-400">•</span>
                            <span>Mezcla géneros inesperados para generar debate en los comentarios.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-cyan-400">•</span>
                            <span>Usa los "Headliners" (letras grandes) para tus artistas top del momento.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-cyan-400">•</span>
                            <span>Haz público tu festival para que otros puedan darle like y subir en el ranking.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full py-6 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0B0F19]">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} MiFestival.
        </div>
      </footer>
    </div>
  );
};

export default Inicio;