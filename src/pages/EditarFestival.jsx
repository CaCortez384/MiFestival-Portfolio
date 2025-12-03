import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { toPng } from "html-to-image";
import PosterFestival from "./PosterFestival";
import mflogo from "../assets/mflogo20.png";
import { AuthContext } from "../context/AuthContext";
// Iconos
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    CalendarDaysIcon,
    XMarkIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const EditarFestival = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [festival, setFestival] = useState(null);
    const [loading, setLoading] = useState(true);
    const [artistas, setArtistas] = useState([]);
    const [nuevoArtista, setNuevoArtista] = useState("");
    const [draggedArtista, setDraggedArtista] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [artistasApi, setArtistasApi] = useState([]);
    
    // Estados para lógica móvil
    const [artistaSeleccionado, setArtistaSeleccionado] = useState(null);
    const [showAsignarModal, setShowAsignarModal] = useState(false);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Día 1');
    const [escenarioSeleccionado, setEscenarioSeleccionado] = useState('');
    
    const [fondoPoster, setFondoPoster] = useState("city");
    const [artistaExpandido, setArtistaExpandido] = useState(null);
    const [isPublic, setIsPublic] = useState(false); // Estado para publicación

    // REFS PARA EL PÓSTER
    const posterRef = useRef(null); 
    const previewContainerRef = useRef(null); 
    const [previewScale, setPreviewScale] = useState(0.3);

    // --- LÓGICA DE ESCALADO DINÁMICO ---
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

    function generarSlug(nombre) {
        return nombre.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }

    // --- CARGAR DATOS ---
    useEffect(() => {
        const fetchArtistasFirestore = async () => {
            try {
                const artistasCol = collection(db, "artistas");
                const artistasSnap = await getDocs(artistasCol);
                const artistas = artistasSnap.docs
                    .map(doc => doc.data())
                    .filter(data => data["Artist Name"])
                    .map(data => ({ nombre: data["Artist Name"] }));
                setArtistasApi(artistas);
            } catch (error) {
                console.error("Error cargando artistas", error);
            }
        };
        fetchArtistasFirestore();
    }, []);

    useEffect(() => {
        const fetchFestival = async () => {
            const docRef = doc(db, "festivals", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFestival({ id: docSnap.id, ...data });
                setArtistas(data.artistas || []);
                setFondoPoster(data.fondoPoster || "city");
                setIsPublic(data.isPublic || false); // Cargar estado público
                
                // Actualizar slug si cambió el nombre
                if (!data.slug && data.name) {
                    const nuevoSlug = generarSlug(data.name);
                    updateDoc(docRef, { slug: nuevoSlug });
                }
            }
            setLoading(false);
        };
        fetchFestival();
    }, [id]);

    // --- ACTUALIZACIONES A FIREBASE ---
    useEffect(() => {
        if (!festival) return;
        const docRef = doc(db, "festivals", id);
        updateDoc(docRef, { fondoPoster });
    }, [fondoPoster, id, festival]);

    const togglePublic = async () => {
        if (!user) return;
        const newState = !isPublic;
        setIsPublic(newState);
        const docRef = doc(db, "festivals", id);
        await updateDoc(docRef, { 
            isPublic: newState,
            userName: user.displayName || "Anónimo",
            likes: festival.likes || 0 
        });
    };

    // --- HANDLERS ---
    const handleAgregarArtista = async () => {
        if (!nuevoArtista.trim()) return;
        const docRef = doc(db, "festivals", id);
        await updateDoc(docRef, {
            artistas: arrayUnion({ nombre: nuevoArtista, dia: null, escenario: null })
        });
        setArtistas([...artistas, { nombre: nuevoArtista, dia: null, escenario: null }]);
        setNuevoArtista("");
    };

    const onDragStart = (artista) => { setDraggedArtista(artista); };

    const onDrop = async (dia, escenario) => {
        if (!draggedArtista) return;
        let nuevosArtistas = artistas.filter(
            a => !(a.nombre === draggedArtista.nombre && a.dia === draggedArtista.dia && a.escenario === draggedArtista.escenario)
        );
        const artistaAsignado = { ...draggedArtista, dia, escenario };
        nuevosArtistas.push(artistaAsignado);
        const docRef = doc(db, "festivals", id);
        await updateDoc(docRef, { artistas: nuevosArtistas });
        setArtistas(nuevosArtistas);
        setDraggedArtista(null);
    };

    const onDragOver = (e) => { e.preventDefault(); };

    const handleEliminarArtista = async (artistaEliminar) => {
        const nuevosArtistas = artistas.filter(
            a => !(a.nombre === artistaEliminar.nombre && a.dia === artistaEliminar.dia && a.escenario === artistaEliminar.escenario)
        );
        const docRef = doc(db, "festivals", id);
        await updateDoc(docRef, { artistas: nuevosArtistas });
        setArtistas(nuevosArtistas);
    };

    const handleDescargarPoster = async () => {
        if (!posterRef.current) return;
        try {
            const dataUrl = await toPng(posterRef.current.firstChild, { pixelRatio: 1, cacheBust: true });
            const link = document.createElement("a");
            link.download = `${generarSlug(festival.name || 'mi-festival')}-poster.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            alert("No se pudo generar la imagen.");
        }
    };

    const handleAsignarArtistaMobile = async () => {
        if (!artistaSeleccionado || !diaSeleccionado || !escenarioSeleccionado) return;
        const nuevosArtistas = [
            ...artistas.filter(a => a.nombre !== artistaSeleccionado.nombre),
            { ...artistaSeleccionado, dia: diaSeleccionado, escenario: escenarioSeleccionado }
        ];
        const docRef = doc(db, "festivals", id);
        await updateDoc(docRef, { artistas: nuevosArtistas });
        setArtistas(nuevosArtistas);
        setShowAsignarModal(false);
        setArtistaSeleccionado(null);
        setDiaSeleccionado('Día 1');
        setEscenarioSeleccionado('');
    };

    // --- RENDERIZADO CONDICIONAL ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
                <p className="text-gray-400 animate-pulse">Cargando editor...</p>
            </div>
        );
    }

    if (!festival) {
        return (
            <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white justify-center items-center p-4">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Festival no encontrado</h2>
                <Link to="/inicio" className="px-6 py-2 rounded-full font-bold text-[#0B0F19] bg-white hover:bg-cyan-400 shadow-lg transition">Ir a Inicio</Link>
            </div>
        );
    }

    if (!user || ((!user.isGuest && festival.userId !== user.uid) || (user.isGuest && festival.userId !== "invitado"))) {
        return (
            <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white items-center justify-center p-4">
                <p className="text-center text-red-400 font-semibold mb-6">No tienes permiso para editar este festival.</p>
                <Link to="/inicio" className="px-6 py-2 rounded-full font-bold text-[#0B0F19] bg-white hover:bg-cyan-400 shadow-lg transition">Volver a Inicio</Link>
            </div>
        );
    }

    const dias = Array.from({ length: festival.days }, (_, i) => `Día ${i + 1}`);
    const escenarios = festival.stages || [];
    const artistasSinAsignar = [
        ...artistas.filter(a => !a.dia && !a.escenario),
        ...artistasApi.filter(apiArtista => !artistas.some(a => a.nombre === apiArtista.nombre))
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
            
            {/* Blobs de luz */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-cyan-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* --- HEADER --- */}
            <header className="w-full px-6 py-4 border-b border-white/5 sticky top-0 z-30 backdrop-blur-md bg-[#0B0F19]/80">
                <div className="container mx-auto flex justify-between items-center max-w-[1400px]">
                    <div className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                            <img src={mflogo} alt="MiFestival Logo" className="relative w-9 h-9 rounded-lg" />
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:inline">Editor</span>
                    </div>
                    <Link
                        to="/inicio"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Volver
                    </Link>
                </div>
            </header>

            {/* --- EDITOR LAYOUT --- */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start max-w-[1400px]">

                {/* 1. SIDEBAR IZQUIERDO: ARTISTAS */}
                <aside className="w-full lg:w-72 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 flex-shrink-0 h-[80vh] lg:sticky lg:top-24 flex flex-col">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Artistas</h2>
                    
                    <div className="relative mb-4">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition"
                        />
                    </div>

                    <ul className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {artistasSinAsignar
                            .filter(artista => artista.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                            .slice(0, 20)
                            .map((artista) => (
                                <React.Fragment key={artista.nombre}>
                                    <li
                                        className="bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 border border-transparent rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer md:cursor-move transition-all flex items-center justify-between group"
                                        draggable={window.innerWidth >= 768}
                                        onDragStart={window.innerWidth >= 768 ? () => onDragStart(artista) : undefined}
                                        onClick={window.innerWidth < 768 ? () => {
                                            setArtistaExpandido(artista.nombre === artistaExpandido ? null : artista.nombre);
                                            setDiaSeleccionado('Día 1');
                                            setEscenarioSeleccionado(escenarios[0] || '');
                                        } : undefined}
                                    >
                                        <span className="truncate">{artista.nombre}</span>
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition"></div>
                                    </li>

                                    {window.innerWidth < 768 && artistaExpandido === artista.nombre && (
                                        <div className="bg-black/40 border border-white/10 rounded-lg p-3 mt-1 flex flex-col gap-2 animate-fade-in-down">
                                            <select
                                                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:border-cyan-500 outline-none"
                                                value={diaSeleccionado}
                                                onChange={e => setDiaSeleccionado(e.target.value)}
                                            >
                                                {dias.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                                            </select>
                                            <select
                                                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:border-cyan-500 outline-none"
                                                value={escenarioSeleccionado}
                                                onChange={e => setEscenarioSeleccionado(e.target.value)}
                                            >
                                                <option value="">Escenario...</option>
                                                {escenarios.map(esc => <option key={esc} value={esc}>{esc}</option>)}
                                            </select>
                                            <button
                                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded-lg transition"
                                                disabled={!diaSeleccionado || !escenarioSeleccionado}
                                                onClick={async () => {
                                                    const nuevos = [...artistas.filter(a => a.nombre !== artista.nombre), { ...artista, dia: diaSeleccionado, escenario: escenarioSeleccionado }];
                                                    await updateDoc(doc(db, "festivals", id), { artistas: nuevos });
                                                    setArtistas(nuevos);
                                                    setArtistaExpandido(null);
                                                }}
                                            >
                                                Asignar
                                            </button>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                    </ul>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoArtista}
                                onChange={e => setNuevoArtista(e.target.value)}
                                placeholder="Nuevo Artista"
                                className="flex-grow min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={handleAgregarArtista}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition shadow-lg shadow-cyan-900/20"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* 2. COLUMNA CENTRAL: GRILLA */}
                <section className="flex-1 w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 overflow-hidden flex flex-col min-h-[600px]">
                    
                    <div className="border-b border-white/10 pb-6 mb-6">
                        <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Nombre del Festival</label>
                        <input
                            type="text"
                            value={festival.name}
                            onChange={async (e) => {
                                const newName = e.target.value;
                                setFestival({ ...festival, name: newName });
                                await updateDoc(doc(db, "festivals", id), { name: newName });
                            }}
                            className="text-3xl md:text-4xl font-bold text-white bg-transparent border-none outline-none placeholder-gray-700 w-full p-0 focus:ring-0"
                            spellCheck={false}
                        />
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><CalendarDaysIcon className="w-4 h-4"/> {dias.length} días</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-grow custom-scrollbar pb-4">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    {dias.map((dia, idx) => (
                                        <th key={idx} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 text-center min-w-[160px]">{dia}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {escenarios.map((escenario, idxEsc) => (
                                    <tr key={idxEsc} className="group/row">
                                        {dias.map((dia, idxDia) => (
                                            <td
                                                key={idxDia}
                                                className="px-2 py-2 border-r border-white/5 last:border-r-0 align-top h-32 transition-colors bg-white/0 hover:bg-white/[0.02]"
                                                onDragOver={onDragOver}
                                                onDrop={() => onDrop(dia, escenario)}
                                            >
                                                <div className="text-[10px] text-gray-600 mb-2 text-center uppercase tracking-widest opacity-30 group-hover/row:opacity-100 transition-opacity">
                                                    {escenario}
                                                </div>

                                                <div className="space-y-1.5 min-h-[80px]">
                                                    {artistas
                                                        .filter(a => a.dia === dia && a.escenario === escenario)
                                                        .map((a, i) => (
                                                            <div
                                                                key={i}
                                                                className="bg-cyan-900/30 border border-cyan-500/20 hover:border-cyan-400/50 rounded px-2.5 py-1.5 text-cyan-100 text-xs font-medium flex items-center justify-between cursor-move group/item shadow-sm backdrop-blur-sm"
                                                                draggable
                                                                onDragStart={() => onDragStart(a)}
                                                            >
                                                                <span className="truncate mr-2">{a.nombre}</span>
                                                                <button
                                                                    className="text-cyan-500/50 hover:text-red-400 transition-colors"
                                                                    title="Eliminar"
                                                                    onClick={() => handleEliminarArtista(a)}
                                                                >
                                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        
                                                    {artistas.filter(a => a.dia === dia && a.escenario === escenario).length === 0 && (
                                                        <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
                                                            <span className="text-xs text-gray-700 font-medium">Soltar aquí</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 3. SIDEBAR DERECHO: PREVIEW & ACTIONS */}
                <aside className="w-full lg:w-80 xl:w-96 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 lg:sticky lg:top-24 flex-shrink-0 flex flex-col gap-6">
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Estilo del Póster</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['city', 'beach', 'desert'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setFondoPoster(style)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition border ${
                                        fondoPoster === style 
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                                        : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* VISTA PREVIA RESPONSIVA */}
                    <div 
                        ref={previewContainerRef}
                        className="rounded-xl overflow-hidden bg-[#0c0032] border border-white/10 shadow-2xl relative group"
                        style={{ width: "100%", aspectRatio: "9/16" }}
                    >
                        <div style={{
                            width: 1080, height: 1920,
                            transform: `scale(${previewScale})`, transformOrigin: "top left",
                            position: "absolute", top: 0, left: 0
                        }}>
                            <PosterFestival
                                festival={{ ...festival, artistas: artistas }}
                                backgroundType={fondoPoster}
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                            <span className="text-white text-xs font-bold tracking-widest uppercase border border-white/30 px-3 py-1 rounded-full backdrop-blur-md">Preview HD</span>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-3">
                        {/* SWITCH PUBLICAR */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <span className="text-sm font-bold text-white block">Hacer Público</span>
                                <span className="text-[10px] text-gray-400">Aparecer en Explorar</span>
                            </div>
                            <button 
                                onClick={togglePublic}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isPublic ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <button
                            onClick={handleDescargarPoster}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all transform hover:-translate-y-0.5"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Descargar HD
                        </button>
                        
                        {navigator.share && (
                            <button
                                onClick={async () => {
                                    if (!posterRef.current) return;
                                    try {
                                        const dataUrl = await toPng(posterRef.current.firstChild, { pixelRatio: 1, cacheBust: true });
                                        const res = await fetch(dataUrl);
                                        const blob = await res.blob();
                                        const file = new File([blob], `${generarSlug(festival.name || 'mi-festival')}.png`, { type: 'image/png' });
                                        const shareUrl = `${window.location.origin}/verfestival/${festival.slug || id}`;
                                        await navigator.share({
                                            files: [file],
                                            title: festival.name,
                                            text: `¡Mira mi lineup!`,
                                            url: shareUrl
                                        });
                                    } catch (err) { console.error(err); }
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-bold py-3 px-4 rounded-xl transition"
                            >
                                <ShareIcon className="w-5 h-5" />
                                Compartir
                            </button>
                        )}
                    </div>
                </aside>

                {/* MODAL MÓVIL (Estilo Glass) */}
                {showAsignarModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-lg font-bold text-white">Asignar Artista</h3>
                                <button onClick={() => setShowAsignarModal(false)} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="text-center py-4">
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Artista seleccionado</span>
                                <div className="text-xl font-bold text-cyan-400 mt-1">{artistaSeleccionado?.nombre}</div>
                            </div>
                            {/* ... Selects con estilo dark ... */}
                            <div className="flex gap-3 pt-2">
                                <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl" onClick={handleAsignarArtistaMobile}>Confirmar</button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl" onClick={() => setShowAsignarModal(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* PÓSTER OCULTO (HD) */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div ref={posterRef}>
                    <PosterFestival festival={{ ...festival, artistas: artistas }} backgroundType={fondoPoster} />
                </div>
            </div>

            <footer className="w-full py-6 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0B0F19]">
                <div className="container mx-auto px-4">© {new Date().getFullYear()} MiFestival.</div>
            </footer>
        </div>
    );
};

export default EditarFestival;