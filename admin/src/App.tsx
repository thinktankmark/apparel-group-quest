import React, { useState, useEffect } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://apparel-hunt-api.onrender.com').replace(/\/$/, '');

interface Analytics {
  totalRegistered: number;
  activePlayers: number;
  completedPlayers: number;
  totalGamesPlayed: number;
  totalPrizesCollected: number;
  completionRate: number;
}

interface PlayerResult {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
  currentSequenceOrder: number;
  isCompleted: boolean;
  completedAt?: string | null;
  isPrizeCollected: boolean;
  prizeCollectedAt?: string | null;
}

interface SequenceItem {
  sequenceId: string;
  sequenceOrder: number;
  gameKey: string;
  store: {
    id: string;
    nameAr: string;
    nameEn: string;
    stationCode: string;
  };
  qrToken: string;
  qrSignedJwt: string;
}

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ag_admin_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PLAYERS' | 'QR_PRINTER' | 'AUDIT'>('DASHBOARD');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<PlayerResult[]>([]);
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeOtps, setActiveOtps] = useState<{ email: string; otpCode: string; expiresAt: number }[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchPlayers();
      fetchSequence();
      fetchLogs();
      fetchActiveOtps();

      const timer = setInterval(() => {
        fetchActiveOtps();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [token]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw data;

      setToken(data.token);
      localStorage.setItem('ag_admin_token', data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAnalytics(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlayers = async (query: string = '') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/players?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPlayers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSequence = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/stores/sequence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSequence(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveOtps = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/otps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setActiveOtps(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPlayersCsv = () => {
    if (!players || players.length === 0) {
      setActionMsg('⚠️ No player records available to export.');
      return;
    }

    const headers = [
      'Player ID',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Registration Date',
      'Current Station Progress',
      'Event Completed',
      'Completion Date',
      'Prize Handed Over',
      'Prize Handover Date'
    ];

    const rows = players.map(p => [
      `"${p.id || ''}"`,
      `"${(p.fullName || '').replace(/"/g, '""')}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.phoneNumber || '').replace(/"/g, '""')}"`,
      `"${p.registeredAt ? new Date(p.registeredAt).toLocaleString() : ''}"`,
      `"Station ${p.currentSequenceOrder || 1} of 4"`,
      `"${p.isCompleted ? 'Yes' : 'No'}"`,
      `"${p.completedAt ? new Date(p.completedAt).toLocaleString() : 'N/A'}"`,
      `"${p.isPrizeCollected ? 'Yes' : 'No'}"`,
      `"${p.prizeCollectedAt ? new Date(p.prizeCollectedAt).toLocaleString() : 'N/A'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Apparel_Group_Scavenger_Hunt_Players_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionMsg('📥 Player data exported successfully to CSV!');
  };

  const handleMarkPrizeCollected = async (playerId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/prizes/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ playerId })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✅ Prize marked collected for player.`);
        fetchPlayers(searchQuery);
        fetchAnalytics();
        fetchLogs();
      } else {
        setActionMsg(`❌ ${data.message || 'Action failed'}`);
      }
    } catch (err: any) {
      setActionMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!token) return;
    const confirmed = window.confirm(`Are you sure you want to delete player "${playerName}"? This will permanently remove their profile and progress.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/players/${playerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`🗑️ Player "${playerName}" deleted successfully.`);
        fetchPlayers(searchQuery);
        fetchAnalytics();
        fetchLogs();
      } else {
        setActionMsg(`❌ ${data.message || 'Delete failed'}`);
      }
    } catch (err: any) {
      setActionMsg(`❌ Error deleting player: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('ag_admin_token');
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B193C', color: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#152B5B', border: '1.5px solid #FEC949', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <h1 style={{ color: '#FEC949', textAlign: 'center', fontSize: '22px', marginBottom: '8px' }}>Apparel Group Admin</h1>
          <p style={{ color: '#9BB1DB', textAlign: 'center', fontSize: '13px', marginBottom: '24px' }}>Staff Verification & Management Portal</p>

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9BB1DB', marginBottom: '6px' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', fontSize: '14px', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9BB1DB', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', fontSize: '14px', boxSizing: 'border-box' }}
                required
              />
            </div>

            {loginError && (
              <div style={{ background: 'rgba(220,53,69,0.2)', border: '1.5px solid #FF5252', color: '#FFB8B8', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
                ⚠️ {loginError}
              </div>
            )}

            <button type="submit" style={{ width: '100%', padding: '14px', background: '#FEC949', border: 'none', borderRadius: '8px', color: '#041B4E', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
              LOG IN TO ADMIN PORTAL
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B193C', color: '#FFF', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header Bar */}
      <header style={{ background: '#152B5B', borderBottom: '1.5px solid #35589A', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', color: '#FEC949', margin: 0 }}>Apparel Group Scavenger Hunt — Admin Portal</h1>
          <span style={{ fontSize: '12px', color: '#9BB1DB' }}>Event Operational Dashboard & Verification</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleExportPlayersCsv}
            style={{ background: '#8CE63D', border: 'none', color: '#041B4E', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}
          >
            📥 Export Excel / CSV
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(220,53,69,0.3)', border: '1px solid #FF5252', color: '#FFB8B8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            Logout 🚪
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionMsg && (
        <div style={{ background: '#041B4E', borderBottom: '1px solid #FEC949', padding: '10px 24px', fontSize: '13px', color: '#FEC949', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Tabs Bar */}
      <nav style={{ background: '#041B4E', borderBottom: '1px solid #35589A', padding: '0 24px', display: 'flex', gap: '8px' }}>
        {(['DASHBOARD', 'PLAYERS', 'QR_PRINTER', 'AUDIT'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '14px 20px',
              background: activeTab === tab ? '#152B5B' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #FEC949' : '3px solid transparent',
              color: activeTab === tab ? '#FEC949' : '#9BB1DB',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {tab === 'DASHBOARD' && '📊 Dashboard & Metrics'}
            {tab === 'PLAYERS' && '👥 Registered Players & Live OTP Lookup'}
            {tab === 'QR_PRINTER' && '🖨️ Store QR Code Poster Generator'}
            {tab === 'AUDIT' && '📜 System Audit Logs'}
          </button>
        ))}
      </nav>

      {/* Body Content */}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'DASHBOARD' && analytics && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#9BB1DB' }}>Total Registered Players</span>
                <h2 style={{ fontSize: '32px', color: '#FEC949', margin: '8px 0 0 0' }}>{analytics.totalRegistered}</h2>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#9BB1DB' }}>Active In-Hunt Players</span>
                <h2 style={{ fontSize: '32px', color: '#4DA1FF', margin: '8px 0 0 0' }}>{analytics.activePlayers}</h2>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#38EF7D' }}>Completed All 4 Stations</span>
                <h2 style={{ fontSize: '32px', color: '#38EF7D', margin: '8px 0 0 0' }}>{analytics.completedPlayers}</h2>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#9BB1DB' }}>Prizes Claimed at Booth</span>
                <h2 style={{ fontSize: '32px', color: '#FFC107', margin: '8px 0 0 0' }}>{analytics.totalPrizesCollected}</h2>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#9BB1DB' }}>Event Completion Rate</span>
                <h2 style={{ fontSize: '32px', color: '#E040FB', margin: '8px 0 0 0' }}>{analytics.completionRate}%</h2>
              </div>
            </div>

            {/* Admin Testing Preview Links Card */}
            <div style={{ background: '#152B5B', border: '1.5px solid #FEC949', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ color: '#FEC949', margin: '0 0 8px 0', fontSize: '16px' }}>🧪 Admin Testing Preview Links (Non-destructive)</h3>
              <p style={{ color: '#9BB1DB', fontSize: '12px', marginBottom: '16px' }}>
                Use these direct links to preview and test any page or minigame without altering real player database records or registration flows.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=WELCOME" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FEC949', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  📖 Welcome Instructions Page ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=CLUE&station=1" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🔍 Station 1 Clue (Skechers) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=GAME&station=1" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#38EF7D', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🎮 Minigame 1 (Memory Match) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=CLUE&station=2" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🔍 Station 2 Clue (ACO) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=GAME&station=2" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#38EF7D', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🎮 Minigame 2 (XO Challenge) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=CLUE&station=3" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🔍 Station 3 Clue (BHPC) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=GAME&station=3" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#38EF7D', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🎮 Minigame 3 (Polo Jump) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=CLUE&station=4" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🔍 Station 4 Clue (Crocs) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=GAME&station=4" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#38EF7D', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🎮 Minigame 4 (Speed Tap) ↗
                </a>
                <a href="https://apparel-scavenger-hunt.vercel.app/?test_view=VICTORY" target="_blank" rel="noreferrer" style={{ padding: '10px 14px', background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', color: '#E040FB', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
                  🏆 Victory Congratulatory Screen ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PLAYERS' && (
          <div>
            {/* Live Active OTP Lookup Banner for Event Booth Staff */}
            {activeOtps.length > 0 && (
              <div style={{ background: 'rgba(254,201,73,0.12)', border: '1.5px solid #FEC949', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', color: '#FEC949', margin: '0 0 8px 0' }}>🔐 Live Verification OTP Codes (Event Staff Lookup)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {activeOtps.map((o, idx) => (
                    <div key={idx} style={{ background: '#041B4E', border: '1px solid #35589A', borderRadius: '8px', padding: '8px 14px', fontSize: '12px' }}>
                      <span style={{ color: '#9BB1DB' }}>{o.email}:</span> <strong style={{ color: '#8CE63D', fontSize: '15px', letterSpacing: '2px', marginLeft: '6px' }}>{o.otpCode}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Search players by Name, Email, or Phone..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  fetchPlayers(e.target.value);
                }}
                style={{ flex: 1, padding: '12px 16px', background: '#152B5B', border: '1px solid #35589A', borderRadius: '8px', color: '#FFF', fontSize: '14px' }}
              />
              <button
                onClick={handleExportPlayersCsv}
                style={{ padding: '12px 20px', background: '#8CE63D', border: 'none', borderRadius: '8px', color: '#041B4E', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📥 Export CSV / Excel
              </button>
            </div>

            <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#041B4E', borderBottom: '1px solid #35589A', color: '#9BB1DB' }}>
                    <th style={{ padding: '14px 16px' }}>Player Details</th>
                    <th style={{ padding: '14px 16px' }}>Current Progress</th>
                    <th style={{ padding: '14px 16px' }}>Event Completed</th>
                    <th style={{ padding: '14px 16px' }}>Prize Status</th>
                    <th style={{ padding: '14px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(53,88,154,0.4)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#FFF' }}>{p.fullName}</div>
                        <div style={{ fontSize: '11.5px', color: '#9BB1DB' }}>{p.email} • {p.phoneNumber}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', background: '#041B4E', borderRadius: '12px', border: '1px solid #35589A', color: '#FEC949' }}>
                          Station {p.currentSequenceOrder} / 4
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.isCompleted ? (
                          <span style={{ color: '#38EF7D', fontWeight: 700 }}>🏆 Completed ({new Date(p.completedAt!).toLocaleTimeString()})</span>
                        ) : (
                          <span style={{ color: '#9BB1DB' }}>⏳ In Progress</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.isPrizeCollected ? (
                          <span style={{ color: '#8CE63D', fontWeight: 700 }}>✅ Collected ({new Date(p.prizeCollectedAt!).toLocaleTimeString()})</span>
                        ) : (
                          <span style={{ color: '#FFC107', fontWeight: 700 }}>🎁 Unclaimed</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {p.isCompleted && !p.isPrizeCollected && (
                          <button
                            onClick={() => handleMarkPrizeCollected(p.id)}
                            style={{ padding: '8px 12px', background: '#8CE63D', border: 'none', borderRadius: '6px', color: '#041B4E', fontWeight: 800, cursor: 'pointer', fontSize: '11.5px' }}
                          >
                            Mark Prize Handed Over 🎁
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePlayer(p.id, p.fullName)}
                          style={{ padding: '8px 12px', background: 'rgba(220,53,69,0.25)', border: '1px solid #FF5252', borderRadius: '6px', color: '#FFB8B8', fontWeight: 700, cursor: 'pointer', fontSize: '11.5px' }}
                        >
                          Delete 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9BB1DB' }}>No players found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'QR_PRINTER' && (
          <div>
            <h2 style={{ color: '#FEC949', marginBottom: '16px' }}>🖨️ Station QR Code Posters (Print Ready)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {sequence.map(s => (
                <div key={s.sequenceId} style={{ background: '#152B5B', border: '1.5px solid #FEC949', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', background: s.sequenceOrder === 0 ? '#38EF7D' : '#FEC949', color: '#041B4E', padding: '4px 10px', borderRadius: '10px', fontWeight: 800 }}>
                    {s.sequenceOrder === 0 ? 'MAIN BOOTH REGISTRATION' : `STATION ${s.sequenceOrder}`}
                  </span>
                  <h3 style={{ color: '#FFF', margin: '12px 0 4px 0' }}>{s.store.nameEn}</h3>
                  <p style={{ color: '#9BB1DB', fontSize: '12px', margin: '0 0 16px 0' }}>{s.store.nameAr}</p>
                  <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&ecc=M&data=${encodeURIComponent(`https://apparel-scavenger-hunt.vercel.app/scan?token=${s.qrToken}`)}`}
                      alt={s.store.nameEn}
                      style={{ width: '220px', height: '220px', display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#9BB1DB', wordBreak: 'break-all', background: '#041B4E', padding: '8px', borderRadius: '6px' }}>
                    Token: {s.qrToken}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div>
            <h2 style={{ color: '#FEC949', marginBottom: '16px' }}>📜 Operational Audit Logs</h2>
            <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '16px' }}>
              {auditLogs.map((log, idx) => (
                <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #041B4E', fontSize: '12px' }}>
                  <span style={{ color: '#FEC949' }}>[{new Date(log.created_at).toLocaleTimeString()}]</span>{' '}
                  <span style={{ color: '#FFF', fontWeight: 700 }}>{log.action}</span> - {JSON.stringify(log.details)}
                </div>
              ))}
              {auditLogs.length === 0 && <p style={{ color: '#9BB1DB' }}>No audit logs recorded yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
