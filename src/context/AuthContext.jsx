import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

// Solo define googleProvider aquí, NO lo importes de ../firebase
const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    // El usuario ya estará autenticado y tu AuthContext lo detectará
  } catch (error) {
    alert("Error al iniciar sesión con Google: " + error.message);
  }
};

export function useAuth() {
  return useContext(AuthContext);
}