import React, { createContext, useContext, useState, useEffect } from 'react';

const isLocalHost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.')
);

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : isLocalHost
    ? `http://${window.location.hostname}:4000`
    : 'https://apparel-hunt-api.onrender.com';

export interface Player {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface Progress {
  currentSequenceOrder: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface ActiveClue {
  sequenceOrder: number;
  gameKey: string;
  store: {
    id: string;
    nameAr: string;
    nameEn: string;
    stationCode: string;
    heroImageUrl: string;
    locationTextAr: string;
    locationTextEn: string;
  };
}

interface AuthContextType {
  token: string | null;
  player: Player | null;
  progress: Progress | null;
  activeClue: ActiveClue | null;
  mainBoothToken: string | null;
  targetQrContext: { storeId: string; sequenceOrder: number; gameKey: string } | null;
  isLoadingProgress: boolean;
  setMainBoothToken: (token: string | null) => void;
  setTargetQrContext: (context: { storeId: string; sequenceOrder: number; gameKey: string } | null) => void;
  login: (phoneNumber: string) => Promise<any>;
  register: (fullName: string, email: string, phoneNumber: string) => Promise<any>;
  logout: () => void;
  refreshProgress: () => Promise<void>;
  completeStage: (sequenceOrder: number, score: number, durationSeconds: number, isSuccess: boolean) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ag_token'));
  const [player, setPlayer] = useState<Player | null>(() => {
    const saved = localStorage.getItem('ag_player');
    return saved ? JSON.parse(saved) : null;
  });
  const [progress, setProgress] = useState<Progress | null>(null);
  const [activeClue, setActiveClue] = useState<ActiveClue | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(!!token);
  const [mainBoothToken, setMainBoothToken] = useState<string | null>(sessionStorage.getItem('ag_main_booth_token'));
  const [targetQrContext, setTargetQrContext] = useState<{ storeId: string; sequenceOrder: number; gameKey: string } | null>(() => {
    const saved = sessionStorage.getItem('ag_target_qr');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      refreshProgress();
    } else {
      setIsLoadingProgress(false);
    }
  }, [token]);

  const refreshProgress = async () => {
    if (!token) {
      setIsLoadingProgress(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/player/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlayer(data.player);
        setProgress(data.progress);
        setActiveClue(data.activeClue);
        localStorage.setItem('ag_player', JSON.stringify(data.player));
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch player progress:', err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const login = async (credential: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, phoneNumber: credential })
    });
    const data = await res.json();
    if (!res.ok) throw data;

    setToken(data.token);
    setPlayer(data.player);
    setProgress(data.progress);
    localStorage.setItem('ag_token', data.token);
    localStorage.setItem('ag_player', JSON.stringify(data.player));
    await refreshProgress();
    return data;
  };

  const register = async (fullName: string, email: string, phoneNumber: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phoneNumber, mainBoothToken })
    });
    const data = await res.json();
    if (!res.ok) throw data;

    setToken(data.token);
    setPlayer(data.player);
    setProgress(data.progress);
    localStorage.setItem('ag_token', data.token);
    localStorage.setItem('ag_player', JSON.stringify(data.player));
    await refreshProgress();
    return data;
  };

  const logout = () => {
    setToken(null);
    setPlayer(null);
    setProgress(null);
    setActiveClue(null);
    localStorage.removeItem('ag_token');
    localStorage.removeItem('ag_player');
  };

  const completeStage = async (sequenceOrder: number, score: number, durationSeconds: number, isSuccess: boolean) => {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${API_BASE}/api/player/game-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sequenceOrder, score, durationSeconds, isSuccess })
    });
    const data = await res.json();
    if (!res.ok) throw data;

    setProgress(data.progress);
    if (data.nextClue) {
      setActiveClue(data.nextClue);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{
      token,
      player,
      progress,
      activeClue,
      mainBoothToken,
      targetQrContext,
      isLoadingProgress,
      setMainBoothToken: (t) => {
        setMainBoothToken(t);
        if (t) sessionStorage.setItem('ag_main_booth_token', t);
        else sessionStorage.removeItem('ag_main_booth_token');
      },
      setTargetQrContext: (ctx) => {
        setTargetQrContext(ctx);
        if (ctx) sessionStorage.setItem('ag_target_qr', JSON.stringify(ctx));
        else sessionStorage.removeItem('ag_target_qr');
      },
      login,
      register,
      logout,
      refreshProgress,
      completeStage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
