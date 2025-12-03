import React, { useEffect, useState, useContext } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import mflogo from "../assets/mflogo20.png";
import PosterFestival from "./PosterFestival";
import { 
    FireIcon, 
    ClockIcon, 
    HeartIcon, 
    ArrowLeftIcon, 
    CalendarDaysIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Explorar = () => {
    const [festivales, setFestivales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('trending'); 
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cargar Festivales
    useEffect(() => {
        const fetchFestivales = async () => {
            setLoading(true);
            try {
                const festivalsRef = collection(db, "festivals");
                let q;

                if (filtro === 'trending') {
                    q = query(festivalsRef, where("isPublic", "==", true), orderBy("likes", "desc"), limit(20));
                } else {
                    q = query(festivalsRef, where("isPublic", "==", true), orderBy("createdAt", "desc"), limit(20));
                }

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFestivales(data);
            } catch (error) {
                console.error("Error cargando feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFestivales();
    }, [filtro]);

    // Manejar Like
    const handleLike = async (e, festival) => {
        e.preventDefault(); 
        if (!user) return alert("Inicia sesión para dar like");

        const isLiked = festival.likesBy?.includes(user.uid);
        const festivalRef = doc(db, "festivals", festival.id);

        const updatedFestivales = festivales.map(f => {
            if (f.id === festival.id) {
                return {
                    ...f,
                    likes: isLiked ? (f.likes - 1) : (f.likes + 1),
                    likesBy: isLiked 
                        ? f.likesBy.filter(id => id !== user.uid)
                        : [...(f.likesBy || []), user.uid]
                };
            }
            return f;
        });
        setFestivales(updatedFestivales);

        try {
            if (isLiked) {
                await updateDoc(festivalRef, {
                    likes: increment(-1),
                    likesBy: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(festivalRef, {
                    likes: increment(1),
                    likesBy: arrayUnion(user.uid)
                });
            }
        } catch (error) {
            console.error("Error al dar like:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white">
            
            {/* Header */}
            <header className="w-full px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80">
                <div className="container mx-auto flex justify-between items-center max-w-7xl">
                    <Link to="/inicio" className="flex items-center gap-3">
                        <img src={mflogo} alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-lg font-bold tracking-tight">Explorar</span>
                    </Link>
                    <Link to="/inicio" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:bg-white/5 transition">
                        <ArrowLeftIcon className="w-4 h-4" /> Volver
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
                
                {/* Filtros */}
                <div className="flex justify-center mb-10 gap-4">
                    <button 
                        onClick={() => setFiltro('trending')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                            filtro === 'trending' 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <FireIcon className="w-5 h-5" /> Tendencias
                    </button>
                    <button 
                        onClick={() => setFiltro('recent')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                            filtro === 'recent' 
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <ClockIcon className="w-5 h-5" /> Recientes
                    </button>
                </div>

                {/* Grid de Festivales */}
                {loading ? (
                    <div className="flex justify-center py-20"><p className="animate-pulse text-gray-500">Cargando el ambiente...</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {festivales.map((festival) => {
                            const isLiked = user ? festival.likesBy?.includes(user.uid) : false;
                            
                            return (
                                <Link 
                                    to={`/VerFestival/${festival.id}`} 
                                    key={festival.id} 
                                    className="group relative bg-[#131722] border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col"
                                >
                                    {/* --- IMAGEN DEL PÓSTER (MODIFICADO) --- */}
                                    {/* CAMBIO 1: aspect-[9/16] para hacerlo alto y delgado */}
                                    <div className={`relative w-full aspect-[9/16] overflow-hidden bg-[#0B0F19]`}>
                                        {/* Poster escalado y CENTRADO */}
                                        <div 
                                            // CAMBIO 2: Clases para centrar el elemento absoluto (left-1/2 -translate-x-1/2) y origen arriba
                                            className="absolute top-0 left-1/2 -translate-x-1/2 origin-top pointer-events-none select-none"
                                            style={{ 
                                                // CAMBIO 3: Escala ajustada ligeramente (0.28) para que llene mejor el nuevo formato vertical
                                                transform: 'scale(0.28)', 
                                                width: '1080px',
                                                height: '1920px'
                                            }}
                                        >
                                            <PosterFestival 
                                                festival={festival} 
                                                backgroundType={festival.fondoPoster || 'city'} 
                                            />
                                        </div>
                                        
                                        {/* Overlay Gradiente */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-40"></div>
                                        
                                        {/* Tag de Autor */}
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] text-gray-200 font-medium">
                                            <span className="text-gray-400">by</span>
                                            <span className="capitalize text-white truncate max-w-[80px]">
                                                {festival.userName || 'Anónimo'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* --- INFO CARD --- */}
                                    <div className="p-4 flex-grow flex flex-col justify-between relative">
                                        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-3 truncate group-hover:text-cyan-400 transition-colors tracking-tight">
                                                {festival.name}
                                            </h3>
                                            
                                            {/* Badges de Info */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-[10px] font-semibold">
                                                    <CalendarDaysIcon className="w-3 h-3"/> {festival.days} Días
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md text-[10px] font-semibold">
                                                    <MapPinIcon className="w-3 h-3"/> {festival.stages?.length || 1} Esc.
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer Tarjeta */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {festival.createdAt?.toDate().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            
                                            <button 
                                                onClick={(e) => handleLike(e, festival)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                                                    isLiked 
                                                    ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/50' 
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white ring-1 ring-white/5'
                                                }`}
                                            >
                                                {isLiked ? <HeartIconSolid className="w-3.5 h-3.5" /> : <HeartIcon className="w-3.5 h-3.5" />}
                                                {festival.likes || 0}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Explorar;