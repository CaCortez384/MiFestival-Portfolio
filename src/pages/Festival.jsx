import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toPng } from "html-to-image";
import PosterFestival from "./PosterFestival";
import mflogo from "../assets/mflogo20.png";
import { AuthContext } from "../context/AuthContext";
// Iconos
import { ArrowLeftIcon, PencilSquareIcon, ArrowDownTrayIcon, ShareIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Festival = () => {
    // --- 1. VALIDACIÓN ROBUSTA DE URL ---
    const params = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const paramValue = params.slugId || params.id;
    const id = paramValue ? (paramValue.includes('-') ? paramValue.split('-').pop() : paramValue) : null;

    const [festival, setFestival] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [artistas, setArtistas] = useState([]);
    const [fondoPoster, setFondoPoster] = useState("city");
    
    // REFS
    const posterRef = useRef(null); 
    const previewContainerRef = useRef(null); 
    const [previewScale, setPreviewScale] = useState(0.3);

    // --- 2. LÓGICA BOTÓN VOLVER INTELIGENTE ---
    const handleVolver = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/inicio');
        }
    };

    // --- 3. ESCALA DINÁMICA ---
    useEffect(() => {
        const calculateScale = () => {
            if (previewContainerRef.current) {
                const containerWidth = previewContainerRef.current.offsetWidth;
                const scale = containerWidth / 1080;
                setPreviewScale(scale);
            }
        };
        calculateScale();
        window.addEventListener('resize', calculateScale);
        const timer = setTimeout(calculateScale, 100);
        return () => {
            window.removeEventListener('resize', calculateScale);
            clearTimeout(timer);
        };
    }, [loading]);

    // --- FUNCIONES DE DESCARGA/COMPARTIR ---
    const generarSlug = (nombre) => nombre.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const handleDescargarPoster = async () => {
        if (!posterRef.current || !festival) return;
        const node = posterRef.current.firstChild; 
        if (!node) return;

        try {
            const dataUrl = await toPng(node, { pixelRatio: 1, cacheBust: true });
            const link = document.createElement("a");
            link.download = `${generarSlug(festival.name || 'mi-festival')}-poster.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            alert("No se pudo generar imagen.");
        }
    };

    const handleSharePoster = async () => {
        if (!posterRef.current || !navigator.share || !festival) return;
        const node = posterRef.current.firstChild;
        if (!node) return;

        try {
            const dataUrl = await toPng(node, { pixelRatio: 1, cacheBust: true });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `${generarSlug(festival.name || 'mi-festival')}.png`, { type: 'image/png' });
            const shareUrl = window.location.href; 
            
            const shareData = {
                title: festival.name || 'Poster',
                text: `¡Mira mi lineup para ${festival.name || 'mi festival'}!`,
                url: shareUrl
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ ...shareData, files: [file] });
            } else {
                await navigator.share({ ...shareData, text: `${shareData.text}\n${shareUrl}` });
            }
        } catch (err) {
            if (err.name !== 'AbortError') alert('No se pudo compartir.');
            console.error(err);
        }
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        let isMounted = true;
        const fetchFestival = async () => {
            if (!id) {
                setError("ID de festival no válido.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const docRef = doc(db, "festivals", id);
                const docSnap = await getDoc(docRef);
                if (isMounted) {
                    if (docSnap.exists()) {
                        setFestival({ id: docSnap.id, ...docSnap.data() });
                        setArtistas(docSnap.data().artistas || []);
                        setFondoPoster(docSnap.data().fondoPoster || "city");
                    } else {
                        setError("Festival no encontrado.");
                        setFestival(null);
                    }
                }
            } catch (err) {
                if (isMounted) { setError("Error al cargar el festival."); console.error(err); }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchFestival();
        return () => { isMounted = false };
    }, [id]);

    // --- RENDERIZADO CONDICIONAL ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
                <p className="text-gray-400 animate-pulse">Cargando festival...</p>
            </div>
        );
    }

    if (error || !festival) {
        return (
            <div className="min-h-screen flex flex-col bg-[#0B0F19]">
                <header className="w-full px-4 sm:px-6 py-3 border-b border-white/5 bg-[#0B0F19]">
                    <div className="container mx-auto flex justify-between items-center">
                        <Link to="/inicio" className="flex items-center gap-2"><img src={mflogo} alt="MiFestival Logo" className="w-8 h-8 rounded-md" /><span className="text-lg font-bold text-white">MiFestival</span></Link>
                        <button onClick={handleVolver} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white transition"><ArrowLeftIcon className="w-4 h-4" />Volver</button>
                    </div>
                </header>
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 text-center max-w-md backdrop-blur-md">
                        <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
                        <p className="text-gray-400 mb-6">{error || "Festival no encontrado"}</p>
                        <button onClick={handleVolver} className="inline-block bg-cyan-600 text-white font-bold py-2 px-6 rounded-full hover:bg-cyan-500 transition">Volver al inicio</button>
                    </div>
                </main>
            </div>
        );
    }

    const dias = Array.from({ length: festival.days || 0 }, (_, i) => `Día ${i + 1}`);
    const escenarios = festival.stages || [];
    const isOwner = user && (festival.userId === user.uid || (user.isGuest && festival.userId === 'invitado'));

    return (
        // FONDO OSCURO
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
            
            {/* Blobs de luz */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="w-full px-4 sm:px-6 py-3 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80">
                 <div className="container mx-auto flex justify-between items-center max-w-[1400px]">
                     <div className="flex items-center gap-2 min-w-0 group">
                         <div className="relative flex-shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                            <img src={mflogo} alt="MiFestival Logo" className="relative w-8 h-8 rounded-md" />
                         </div>
                         <span className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{festival.name || 'Detalle'}</span>
                     </div>
                     
                     <div className="flex items-center gap-2">
                         <button
                             onClick={handleVolver}
                             className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10 whitespace-nowrap"
                         >
                             <ArrowLeftIcon className="w-4 h-4" />
                             Volver
                         </button>

                         {isOwner && (
                             <Link
                                 to={`/editarFestival/${id}`}
                                 className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold text-[#0B0F19] bg-white hover:bg-cyan-400 transition whitespace-nowrap shadow-lg shadow-white/10"
                             >
                                 <PencilSquareIcon className="w-4 h-4" />
                                 <span className="hidden sm:inline">Editar</span>
                             </Link>
                         )}
                     </div>
                 </div>
             </header>

            {/* Layout Principal */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start max-w-[1400px]">

                {/* Columna Izquierda: Grilla */}
                <section className="flex-grow w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 overflow-hidden">
                    <div className="mb-6 border-b border-white/10 pb-4">
                         <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{festival.name || 'Festival'}</h1>
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                             <span className="inline-flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md border border-white/5"><CalendarDaysIcon className="w-4 h-4 text-purple-400"/>{dias.length} {dias.length === 1 ? 'día' : 'días'}</span>
                             <span className="inline-flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md border border-white/5"><MapPinIcon className="w-4 h-4 text-pink-400"/>{escenarios.length} {escenarios.length === 1 ? 'escenario' : 'escenarios'}</span>
                         </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar pb-2">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 bg-[#161b28] px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 text-left z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">Escenario</th>
                                    {dias.map((dia) => (
                                        <th key={dia} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 text-center min-w-[140px]">{dia}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {escenarios.map((escenario) => (
                                    <tr key={escenario} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="sticky left-0 bg-[#1a1f2e] px-4 py-3 text-sm font-bold text-cyan-100 border-b border-white/5 whitespace-nowrap z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">{escenario}</td>
                                        {dias.map((dia) => {
                                            const artistasEnCelda = artistas.filter(a => a.dia === dia && a.escenario === escenario);
                                            return (
                                                <td key={`${dia}-${escenario}`} className="px-2 py-2 text-xs border-b border-white/5 align-top h-24">
                                                    <div className="space-y-1.5">
                                                        {artistasEnCelda.map((a, i) => (
                                                            <div key={i} className="bg-cyan-900/30 border border-cyan-500/20 rounded px-2.5 py-1.5 text-cyan-100 text-xs font-medium truncate backdrop-blur-sm">
                                                                {a.nombre}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {artistasEnCelda.length === 0 && <span className="text-gray-600 italic text-[10px] block text-center mt-2">-</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Columna Derecha: Vista Previa */}
                <aside className="w-full lg:w-80 xl:w-96 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 lg:sticky lg:top-24 flex-shrink-0 space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Póster Oficial</h2>
                        
                        {/* Selector de fondo */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['city', 'beach', 'desert'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setFondoPoster(style)}
                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold capitalize transition border ${
                                        fondoPoster === style 
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                                        : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>

                        {/* PREVIEW CONTAINER */}
                        <div 
                            ref={previewContainerRef} 
                            className="rounded-xl overflow-hidden bg-[#0c0032] border border-white/10 shadow-2xl relative group"
                            style={{
                                width: "100%",
                                aspectRatio: "9/16", 
                            }}
                        >
                            <div style={{
                                width: 1080, 
                                height: 1920,
                                transform: `scale(${previewScale})`, 
                                transformOrigin: "top left",
                                position: "absolute",
                                top: 0,
                                left: 0
                            }}>
                                <PosterFestival
                                    festival={{ ...festival, artistas: artistas }}
                                    backgroundType={fondoPoster}
                                />
                            </div>
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center pointer-events-none">
                                <span className="text-white text-xs font-bold uppercase tracking-widest border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">Preview</span>
                            </div>
                        </div>
                    </div>

                    {/* HD RENDER (HIDDEN) */}
                    <div style={{ position: "absolute", left: "-99999px", top: 0 }}>
                        <div ref={posterRef}>
                            <PosterFestival
                                festival={{ ...festival, artistas: artistas }}
                                backgroundType={fondoPoster}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <button
                            onClick={handleDescargarPoster}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all transform hover:-translate-y-0.5"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Descargar HD
                        </button>
                        {navigator.share && (
                            <button
                                onClick={handleSharePoster}
                                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-bold py-3 px-4 rounded-xl transition"
                            >
                                <ShareIcon className="w-5 h-5" />
                                Compartir
                            </button>
                        )}
                    </div>
                
                </aside>
            </main>

            <footer className="w-full py-6 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0B0F19]">
                 <div className="container mx-auto px-4 sm:px-6">© {new Date().getFullYear()} MiFestival.</div>
            </footer>
        </div>
    );
};

export default Festival;