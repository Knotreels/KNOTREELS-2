'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import { auth, db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import LogoLoader from '@/components/LogoLoader';

interface ExtendedUser extends FirebaseUser {
  username?: string;
  avatar?: string;
  role?: string;
  tips?: number;
  boosts?: number;
  credits?: number;
  bio?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const publicRoutes = ['/checkout/success', '/checkout/cancel'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        const stop = onSnapshot(userRef, (docSnap) => {
          const data = docSnap.data();
          if (data) {
            setUser({
              ...firebaseUser,
              username: data.username,
              avatar: data.avatar,
              role: data.role,
              tips: data.tips,
              boosts: data.boosts,
              credits: data.credits,
              bio: data.bio || '',
            });
          }
        });

        return stop;
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading && !publicRoutes.includes(pathname)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <LogoLoader />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
