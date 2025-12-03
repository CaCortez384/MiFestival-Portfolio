import React, { useState, useContext } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import mflogo from "../assets/mflogo20.png";
import { AuthContext } from "../context/AuthContext";
// Iconos Heroicons
import { ArrowLeftIcon, TicketIcon, CalendarDaysIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

function generarSlug(nombre) {
    return nombre
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}

const CreateFestival = () => {
    const [name, setName] = useState("");
    const [days, setDays] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Por favor, dale un nombre a tu festival.");
            return;
        }
        if (days < 1 || days > 30) {
            setError("El número de días debe estar entre 1 y 30.");
            return;
        }

        setLoading(true);
        try {
            if (!user) {
                setError("Debes iniciar sesión o usar modo invitado para crear un festival.");
                setLoading(false);
                return;
            }
            const slug = generarSlug(name);
            const initialStages = ["Escenario Principal"];
            const docRef = await addDoc(collection(db, "festivals"), {
                name: name.trim(),
                slug,
                days: Number(days),
                stages: initialStages,
                fondoPoster: "city",
                createdAt: serverTimestamp(),
                userId: user.isGuest ? "invitado" : user.uid,
            });
            navigate(`/editarFestival/${docRef.id}`);
        } catch (error) {
            setError("Error al guardar el festival. Intenta de nuevo.");
            console.error("Error creating festival:", error);
            setLoading(false);
        }
    };

    const ejemplos = [
        { nombre: "Lollapalooza Home", dias: 3 },
        { nombre: "Summer Vibes", dias: 2 },
    ];

    return (
        // FONDO OSCURO + LUCES
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
            
            {/* Blobs de luz */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
            </div>

            {/* --- HEADER --- */}
            <header className="w-full px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80">
                <div className="container mx-auto flex justify-between items-center max-w-7xl">
                    <Link to="/inicio" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                            <img src={mflogo} alt="MiFestival Logo" className="relative w-9 h-9 rounded-lg" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors hidden sm:inline">MiFestival</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Volver
                    </button>
                </div>
            </header>

            {/* --- MAIN CARD --- */}
            <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-16 relative z-10">
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-2xl relative">
                    
                    {/* Luz superior decorativa */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-[2px]"></div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Nuevo Festival</h1>
                        <p className="text-sm text-gray-400">
                            El primer paso para crear tu lineup soñado.
                        </p>
                    </div>

                    {/* Aviso Invitado */}
                    {user?.isGuest && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm rounded-xl p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
                            <span className="mt-0.5 text-lg">⚠️</span>
                            <div>
                                <span className="font-bold text-yellow-400">Modo Invitado:</span> Tus festivales no se guardarán permanentemente. <Link to="/register" className="font-bold underline hover:text-yellow-100 transition">Regístrate gratis</Link>.
                            </div>
                        </div>
                    )}

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-xl p-3 mb-6 text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} id="create-festival" className="space-y-6">
                        
                        {/* Input Nombre */}
                        <div>
                            <label htmlFor="festival-name" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                Nombre del Festival <span className="text-cyan-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <MusicalNoteIcon className="h-5 w-5" />
                                </div>
                                <input
                                    id="festival-name"
                                    type="text"
                                    placeholder="Ej: Lollapalooza 2026"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Input Días */}
                        <div>
                            <label htmlFor="festival-days" className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                Duración (Días) <span className="text-cyan-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-32">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <CalendarDaysIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={days === 0 ? "" : days}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDays(val === "" ? 0 : Number(val));
                                        }}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-[#0B0F19]/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-white placeholder-gray-600 transition duration-200"
                                    />
                                </div>
                                <span className="text-sm text-gray-500 italic">Recomendado 3 días</span>
                            </div>
                        </div>

                        {/* Botón Crear */}
                        <button 
                            id="create-festival"
                            type="submit"
                            disabled={loading}
                            className={`w-full text-center bg-cyan-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 ${
                                loading
                                    ? 'opacity-70 cursor-not-allowed'
                                    : 'hover:bg-cyan-500 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creando...
                                </span>
                            ) : (
                                "Empezar a Diseñar →"
                            )}
                        </button>
                    </form>

                    {/* Sección Inspiración (Estilo Glass Chips) */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h3 className="text-xs font-bold text-gray-500 mb-4 text-center uppercase tracking-wider">Ideas Populares</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {ejemplos.map((ej, idx) => (
                                <button 
                                    key={idx} 
                                    type="button"
                                    onClick={() => { setName(ej.nombre); setDays(ej.dias); }}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 transition-colors flex items-center gap-2"
                                >
                                    <TicketIcon className="w-3 h-3 text-purple-400" />
                                    <span className="font-semibold text-white">{ej.nombre}</span>
                                    <span className="text-gray-500 border-l border-white/10 pl-2">{ej.dias}d</span>
                                </button>
                            ))}
                        </div>
                    </div>

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
};

export default CreateFestival;