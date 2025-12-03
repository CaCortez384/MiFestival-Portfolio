import { useNavigate } from "react-router-dom";
import mflogo from "../assets/mflogo20.png";
import banner from "../assets/banner.png";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
// Iconos
import { SparklesIcon, ArrowRightIcon, BoltIcon, FireIcon, UserGroupIcon, HeartIcon, GlobeAltIcon, MusicalNoteIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGuest = () => {
    setUser({ isGuest: true, displayName: "Invitado" });
    navigate("/inicio");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      
      {/* Efectos de fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* --- HEADER CORREGIDO PARA MÓVIL --- */}
      <header className="w-full px-4 sm:px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                <img src={mflogo} alt="MiFestival Logo" className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">MiFestival</span>
          </Link>

          {/* Navegación Responsive */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              // CAMBIO: Quitamos 'hidden'. Ahora es visible siempre. Ajustamos padding para móvil.
              className="px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition whitespace-nowrap"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              // CAMBIO: Texto más corto en móvil ("Crear") para ahorrar espacio
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#0B0F19] bg-white hover:bg-cyan-400 transition transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)] whitespace-nowrap"
            >
              <span className="hidden sm:inline">Crear Cuenta</span>
              <span className="sm:hidden">Crear</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Texto Hero */}
            <div className="lg:w-1/2 text-center lg:text-left z-10">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
                <SparklesIcon className="w-4 h-4" /> Ahora con Comunidad y Likes
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Crea, Comparte y <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                  Viraliza tu Festival.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Diseña el cartel definitivo sin Spotify. Publica tu lineup en nuestra comunidad global, recibe likes y llega al top de tendencias.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-cyan-600 font-lg rounded-xl hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 w-full sm:w-auto"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition duration-200"></div>
                  <span className="relative flex items-center gap-2">
                    Empezar Gratis <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                  </span>
                </Link>
                <button
                  onClick={handleGuest}
                  className="px-8 py-4 rounded-xl text-white font-semibold border border-white/20 hover:bg-white/10 transition backdrop-blur-sm w-full sm:w-auto"
                >
                  Probar Demo
                </button>
              </div>
              
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div> 100% Gratis</span>
                <span className="flex items-center gap-2"><HeartIcon className="w-4 h-4 text-red-500"/> Comunidad Social</span>
                <span className="flex items-center gap-2"><BoltIcon className="w-4 h-4 text-yellow-500"/> Sin Spotify</span>
              </div>
            </div>

            {/* Imagen Hero */}
            <div className="lg:w-1/2 relative perspective-1000 w-full">
              <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition duration-500 ease-out">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-30"></div>
                <img
                  src={banner}
                  alt="Generador de cartel de festival de música online"
                  className="relative w-full rounded-2xl shadow-2xl border border-white/10 bg-[#151923]"
                />
                <div className="absolute -bottom-6 -left-6 bg-[#1a1f2e] border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md hidden md:block animate-bounce-slow">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/10 p-2 rounded-full text-red-500">
                            <HeartIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold">Nuevo Top #1</p>
                            <p className="text-gray-400 text-xs">Festival Primavera</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-[#0B0F19] relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Más que una herramienta. <span className="text-cyan-400">Una comunidad.</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">La mejor alternativa a Instafest. Únete a miles de creadores, descubre música nueva y comparte tu visión.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition"></div>
                <MusicalNoteIcon className="w-12 h-12 text-cyan-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Libertad Musical</h3>
                <p className="text-gray-400">Escribe lo que quieras. Bandas locales, artistas indie o headliners mundiales. No dependes de tu historial de escucha.</p>
            </div>

            <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition"></div>
                <UserGroupIcon className="w-12 h-12 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Comunidad Viral</h3>
                <p className="text-gray-400">Publica tu festival en nuestra galería global. Recibe likes, sube en el ranking de tendencias y compite con otros usuarios.</p>
            </div>

            <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 transition duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-500/20 transition"></div>
                <FireIcon className="w-12 h-12 text-pink-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Calidad HD</h3>
                <p className="text-gray-400">Exporta en PNG de alta resolución (1080x1920) perfecto para Instagram Stories, TikTok y Twitter. Sin marcas de agua molestas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEO CONTENT & FAQ (NUEVA SECCIÓN TEXTO) --- */}
      <section className="py-20 border-t border-white/5 bg-[#0e121e]">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            
            {/* Texto descriptivo para Google */}
            <div className="mb-16 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-6">El Creador de Carteles de Festivales Online #1</h2>
                <div className="prose prose-invert prose-lg text-gray-400 max-w-none">
                    <p className="mb-4">
                        ¿Alguna vez has soñado con organizar tu propio evento musical? <strong>MiFestival</strong> es la herramienta gratuita que te permite convertirte en promotor por un día. A diferencia de otros generadores automáticos, aquí tienes el <strong>control total</strong>.
                    </p>
                    <p>
                        No necesitas conectar tu cuenta de Spotify ni Apple Music. Simplemente ingresa los nombres de tus artistas favoritos, organiza los escenarios por días y personaliza el estilo visual. Ya sea un festival de rock en el desierto o una fiesta electrónica en la playa, tu imaginación es el único límite.
                    </p>
                </div>
            </div>

            {/* Grid FAQ */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                    <QuestionMarkCircleIcon className="w-8 h-8 text-cyan-400" />
                    <h3 className="text-2xl font-bold text-white">Preguntas Frecuentes</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">¿Es realmente gratis?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Sí, 100%. Puedes crear, editar y descargar tantos pósters como quieras. No hay muros de pago para las funciones premium como la descarga en HD.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">¿Cómo funciona el ranking social?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Al crear tu festival, puedes marcarlo como "Público". Aparecerá en la sección Explorar donde otros usuarios pueden darle "Like". ¡Los más votados aparecen en Tendencias!</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">¿Necesito Spotify?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">No. MiFestival es una alternativa manual a Instafest. Es ideal si escuchas música en YouTube, vinilos, o si quieres crear un cartel de fantasía con bandas que ya no existen.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">¿Puedo personalizar el fondo?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Sí. Ofrecemos varios temas visuales (Ciudad Nocturna, Playa al Atardecer, Desierto) que adaptan la paleta de colores de tu cartel automáticamente.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-[#0B0F19] z-0"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">¿Listo para ser el Headliner?</h2>
            <Link
                to="/register"
                className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-black bg-white rounded-full hover:bg-cyan-400 transition transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
                Empezar Ahora
            </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full py-8 border-t border-white/5 bg-[#0B0F19]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MiFestival. Todos los derechos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-cyan-400 transition cursor-pointer">Privacidad</span>
            <span className="hover:text-cyan-400 transition cursor-pointer">Términos</span>
            <a href="https://github.com/CaCortez384" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;