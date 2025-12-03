import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { updateProfile, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
// CORRECCIÓN AQUÍ: Se agregó Link
import { useNavigate, Link } from 'react-router-dom';
import mflogo from "../assets/mflogo20.png";
import { 
    UserCircleIcon, FireIcon, TicketIcon, ArrowLeftIcon, 
    PencilSquareIcon, ArrowRightOnRectangleIcon, TrashIcon, 
    LockClosedIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
    HeartIcon, 
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Perfil = () => {
    const { user, setUser } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalFestivales: 0, totalLikes: 0 });
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || "");
    const [loading, setLoading] = useState(true);
    
    // Estado para validar la palabra "ELIMINAR"
    const [deleteInput, setDeleteInput] = useState(''); 

    // Estado del Modal
    const [modal, setModal] = useState({ 
        show: false, 
        type: '', 
        title: '', 
        message: '',
        onConfirm: null 
    });

    const navigate = useNavigate();

    const showModal = (type, title, message, onConfirm = null) => {
        setModal({ show: true, type, title, message, onConfirm });
    };

    const closeModal = () => {
        setModal({ ...modal, show: false });
        setDeleteInput(''); 
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const qStats = query(collection(db, "festivals"), where("userId", "==", user.uid));
                const snapshotStats = await getDocs(qStats);
                let count = 0;
                let likes = 0;
                snapshotStats.forEach((doc) => {
                    count++;
                    likes += (doc.data().likes || 0);
                });
                setStats({ totalFestivales: count, totalLikes: likes });

                const qFavs = query(collection(db, "festivals"), where("likesBy", "array-contains", user.uid));
                const snapshotFavs = await getDocs(qFavs);
                const favsData = snapshotFavs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFavorites(favsData);

            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        try {
            await updateProfile(auth.currentUser, { displayName: newName });
            setUser({ ...user, displayName: newName });
            setIsEditing(false);
            showModal('success', '¡Nombre Actualizado!', 'Tu perfil ahora luce genial con tu nuevo nombre.');
        } catch (error) {
            console.error(error);
            showModal('error', 'Error', 'No se pudo actualizar el nombre.');
        }
    };

    const handleChangePassword = async () => {
        if (user.providerData[0]?.providerId === 'google.com') {
            showModal('error', 'Cuenta de Google', 'Debes cambiar tu contraseña desde tu configuración de Google.');
            return;
        }
        
        showModal('confirm', '¿Cambiar contraseña?', `Enviaremos un correo a ${user.email} para restablecerla.`, async () => {
            try { 
                await sendPasswordResetEmail(auth, user.email); 
                closeModal(); 
                setTimeout(() => showModal('success', 'Correo Enviado', 'Revisa tu bandeja de entrada.'), 300);
            } 
            catch (error) { 
                console.error(error);
                closeModal();
                showModal('error', 'Error', 'No se pudo enviar el correo.');
            }
        });
    };

    const handleLogout = async () => { await auth.signOut(); navigate('/'); };

    const handleDeleteAccountRequest = () => {
        setDeleteInput(''); 
        showModal('delete-account', '¿Eliminar Cuenta Permanentemente?', 'Esta acción borrará todos tus festivales y datos. No hay vuelta atrás.', executeDeleteAccount);
    };

    const executeDeleteAccount = async () => {
        setModal({ ...modal, type: 'loading', title: 'Eliminando...', message: 'Por favor espera.' });

        try {
            const q = query(collection(db, "festivals"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "festivals", d.id)));
            await Promise.all(deletePromises);

            await deleteUser(auth.currentUser);
            navigate('/');
            
        } catch (error) {
            console.error("Error eliminando cuenta:", error);
            closeModal(); 
            
            if (error.code === 'auth/requires-recent-login') {
                setTimeout(() => {
                    showModal('error', 'Seguridad', 'Para eliminar tu cuenta, necesitas haber iniciado sesión recientemente. Por favor, cierra sesión e ingresa de nuevo.');
                }, 300);
            } else {
                setTimeout(() => {
                    showModal('error', 'Error Crítico', 'Ocurrió un error al intentar eliminar la cuenta.');
                }, 300);
            }
        }
    };

    const getBadges = () => {
        const badges = [];
        if (stats.totalFestivales >= 1) badges.push({ label: "Creador", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" });
        if (stats.totalFestivales >= 5) badges.push({ label: "Promotor Pro", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" });
        if (stats.totalLikes >= 1) badges.push({ label: "Primer Fan", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" });
        if (stats.totalLikes >= 10) badges.push({ label: "Rising Star", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" });
        if (stats.totalLikes >= 50) badges.push({ label: "Leyenda", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" });
        return badges;
    };

    if (!user) return null;
    const isGoogleUser = user.providerData[0]?.providerId === 'google.com';
    const userBadges = getBadges();

    return (
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans relative overflow-x-hidden">
            
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[30%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]"></div>
            </div>

            <header className="w-full px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80">
                <div className="container mx-auto flex justify-between items-center max-w-4xl">
                    <div className="flex items-center gap-3">
                        <img src={mflogo} alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-lg font-bold">Mi Perfil</span>
                    </div>
                    <button onClick={() => navigate('/inicio')} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:bg-white/5 transition">
                        <ArrowLeftIcon className="w-4 h-4" /> Volver
                    </button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
                
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-8">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-purple-600"></div>

                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-[#0B0F19] shadow-xl" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-4 border-[#0B0F19] shadow-xl">
                                    <span className="text-3xl font-bold text-white">{user.displayName?.charAt(0) || "U"}</span>
                                </div>
                            )}
                            <button onClick={() => setIsEditing(!isEditing)} className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full hover:bg-cyan-500 transition shadow-lg">
                                <PencilSquareIcon className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {isEditing ? (
                            <div className="flex gap-2 mb-2 w-full max-w-xs justify-center">
                                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-black/30 border border-white/20 rounded-lg px-3 py-1 text-center text-white focus:border-cyan-500 outline-none" />
                                <button onClick={handleUpdateName} className="bg-green-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-500 transition">OK</button>
                            </div>
                        ) : (
                            <h1 className="text-3xl font-bold text-white mb-1">{user.displayName || "Usuario"}</h1>
                        )}
                        <p className="text-sm text-gray-500 mb-4">{user.email}</p>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {userBadges.length > 0 ? userBadges.map((badge, i) => (
                                <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                                    {badge.label}
                                </span>
                            )) : (
                                <span className="px-3 py-1 rounded-full text-[10px] bg-white/5 text-gray-500 border border-white/5">Sin insignias aún</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex border-b border-white/10 mb-6">
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'stats' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Estadísticas
                    </button>
                    <button 
                        onClick={() => setActiveTab('favorites')}
                        className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'favorites' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Favoritos ({favorites.length})
                    </button>
                </div>

                {activeTab === 'stats' ? (
                    <div className="animate-fade-in-up">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                                <span className="text-4xl font-black text-white mb-2">{stats.totalFestivales}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2">
                                    <TicketIcon className="w-4 h-4 text-purple-400" /> Festivales
                                </span>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center">
                                <span className="text-4xl font-black text-white mb-2">{stats.totalLikes}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2">
                                    <FireIcon className="w-4 h-4 text-orange-500" /> Impacto Social
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {!isGoogleUser && !user.isGuest && (
                                <button onClick={handleChangePassword} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold py-3 rounded-xl transition border border-white/5">
                                    <LockClosedIcon className="w-5 h-5" /> Cambiar Contraseña
                                </button>
                            )}
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 rounded-xl transition">
                                <ArrowRightOnRectangleIcon className="w-5 h-5" /> Cerrar Sesión
                            </button>
                            
                            {!user.isGuest && (
                                <button onClick={handleDeleteAccountRequest} className="w-full text-red-500/60 hover:text-red-500 text-xs mt-4 py-2 transition font-bold uppercase tracking-wider">
                                    Eliminar cuenta permanentemente
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
                        {favorites.length > 0 ? favorites.map(fav => (
                            <Link to={`/festival/${fav.id}/artistas`} key={fav.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-pink-500/30 transition group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white truncate pr-2 group-hover:text-pink-300 transition">{fav.name}</h4>
                                    <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                        <HeartIconSolid className="w-3 h-3" /> {fav.likes}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 flex gap-3">
                                    <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3 h-3"/> {fav.days}d</span>
                                    <span className="flex items-center gap-1"><UserCircleIcon className="w-3 h-3"/> {fav.userName || 'Anon'}</span>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <HeartIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>Aún no tienes favoritos.</p>
                                <Link to="/explorar" className="text-pink-400 text-sm font-bold hover:underline mt-2 block">Ir a Explorar</Link>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative transform transition-all scale-100">
                        
                        <div className="flex justify-center mb-4">
                            {modal.type === 'success' && <CheckCircleIcon className="w-12 h-12 text-green-400" />}
                            {modal.type === 'error' && <XCircleIcon className="w-12 h-12 text-red-400" />}
                            {(modal.type === 'confirm' || modal.type === 'delete-account') && <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400" />}
                            {modal.type === 'loading' && (
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-white text-center mb-2">{modal.title}</h3>
                        <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">{modal.message}</p>

                        {modal.type === 'delete-account' && (
                            <div className="mb-6">
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 text-center font-bold">
                                    Escribe "ELIMINAR" para confirmar
                                </label>
                                <input 
                                    type="text" 
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    className="w-full bg-black/30 border border-red-500/30 rounded-lg py-2 px-3 text-center text-white placeholder-gray-700 focus:border-red-500 outline-none transition"
                                    placeholder="ELIMINAR"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            {(modal.type === 'confirm' || modal.type === 'delete-account') ? (
                                <>
                                    <button 
                                        onClick={closeModal}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={modal.onConfirm}
                                        disabled={modal.type === 'delete-account' && deleteInput !== 'ELIMINAR'}
                                        className={`flex-1 font-bold py-3 rounded-xl transition ${
                                            modal.type === 'delete-account' && deleteInput !== 'ELIMINAR'
                                            ? 'bg-red-500/20 text-red-500/50 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                                        }`}
                                    >
                                        Confirmar
                                    </button>
                                </>
                            ) : modal.type !== 'loading' && (
                                <button 
                                    onClick={closeModal}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Entendido
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;