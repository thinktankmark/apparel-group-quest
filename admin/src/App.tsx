import React, { useState, useEffect } from 'react';

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
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchPlayers();
      fetchSequence();
      fetchLogs();
    }
  }, [token]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
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
      const res = await fetch('/api/admin/analytics', {
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
      const res = await fetch(`/api/admin/players?search=${encodeURIComponent(query)}`, {
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
      const res = await fetch('/api/admin/stores/sequence', {
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
      const res = await fetch('/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPrizeCollected = async (playerId: string) => {
    if (!token) return;
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/prizes/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ playerId })
      });
      const data = await res.json();
      if (!res.ok) throw data;

      setActionMsg(`✅ Prize marked as collected for player!`);
      fetchPlayers(searchQuery);
      fetchAnalytics();
      fetchLogs();
    } catch (err: any) {
      setActionMsg(`⚠️ ${err.message || 'Failed to mark prize as collected'}`);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#081229' }}>
        <form onSubmit={handleAdminLogin} style={{ width: '340px', background: '#152B5B', border: '1.5px solid #FEC949', borderRadius: '16px', padding: '32px 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#FEC949', marginBottom: '8px' }}>Apparel Group Admin</h2>
          <p style={{ textAlign: 'center', color: '#9BB1DB', fontSize: '13px', marginBottom: '24px' }}>Staff Verification & Management Portal</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#FFF' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', height: '40px', background: '#0B193C', border: '1px solid #35589A', borderRadius: '8px', padding: '0 12px', color: '#FFF' }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#FFF' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', height: '40px', background: '#0B193C', border: '1px solid #35589A', borderRadius: '8px', padding: '0 12px', color: '#FFF' }}
              required
            />
          </div>

          {loginError && <div style={{ color: '#FF5252', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>⚠️ {loginError}</div>}

          <button type="submit" style={{ width: '100%', height: '44px', background: '#FEC949', border: 'none', borderRadius: '8px', color: '#1B3774', fontWeight: 700, cursor: 'pointer' }}>
            LOG IN TO ADMIN PORTAL
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#081229' }}>
      {/* Admin Header */}
      <div style={{ height: '60px', background: '#152B5B', borderBottom: '1px solid #35589A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#FEC949' }}>Apparel Group</span>
          <span style={{ fontSize: '12px', color: '#9BB1DB', background: '#0B193C', padding: '2px 8px', borderRadius: '4px' }}>Staff Admin Portal</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('DASHBOARD')} style={{ background: activeTab === 'DASHBOARD' ? '#FEC949' : 'transparent', color: activeTab === 'DASHBOARD' ? '#1B3774' : '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Dashboard</button>
          <button onClick={() => setActiveTab('PLAYERS')} style={{ background: activeTab === 'PLAYERS' ? '#FEC949' : 'transparent', color: activeTab === 'PLAYERS' ? '#1B3774' : '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Prize Collection</button>
          <button onClick={() => setActiveTab('QR_PRINTER')} style={{ background: activeTab === 'QR_PRINTER' ? '#FEC949' : 'transparent', color: activeTab === 'QR_PRINTER' ? '#1B3774' : '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Venue QR Posters</button>
          <button onClick={() => setActiveTab('AUDIT')} style={{ background: activeTab === 'AUDIT' ? '#FEC949' : 'transparent', color: activeTab === 'AUDIT' ? '#1B3774' : '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Audit Logs</button>
          <button onClick={() => { setToken(null); localStorage.removeItem('ag_admin_token'); }} style={{ background: '#FF5252', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {actionMsg && (
          <div style={{ padding: '12px 16px', background: '#152B5B', border: '1px solid #FEC949', borderRadius: '8px', marginBottom: '20px', color: '#FFF', fontSize: '13px' }}>
            {actionMsg}
          </div>
        )}

        {/* Tab 1: Analytics Dashboard */}
        {activeTab === 'DASHBOARD' && analytics && (
          <div>
            <h2 style={{ color: '#FEC949', marginBottom: '20px' }}>Real-Time Event Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FEC949' }}>{analytics.totalRegistered}</div>
                <div style={{ fontSize: '12px', color: '#9BB1DB', marginTop: '4px' }}>Registered Players</div>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#8CE63D' }}>{analytics.completedPlayers}</div>
                <div style={{ fontSize: '12px', color: '#9BB1DB', marginTop: '4px' }}>Completed Players</div>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFF' }}>{analytics.totalPrizesCollected}</div>
                <div style={{ fontSize: '12px', color: '#9BB1DB', marginTop: '4px' }}>Prizes Collected</div>
              </div>
              <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FEC949' }}>{analytics.completionRate}%</div>
                <div style={{ fontSize: '12px', color: '#9BB1DB', marginTop: '4px' }}>Completion Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Player Search & Prize Collection */}
        {activeTab === 'PLAYERS' && (
          <div>
            <h2 style={{ color: '#FEC949', marginBottom: '16px' }}>Main Booth Staff Prize Verification</h2>
            <p style={{ color: '#9BB1DB', fontSize: '13px', marginBottom: '20px' }}>
              Search player by Email Address or Phone Number. Verify their completion proof on phone screen and mark prize as collected.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search by Email Address or Phone Number..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  fetchPlayers(e.target.value);
                }}
                style={{ flex: 1, height: '44px', background: '#152B5B', border: '1.5px solid #35589A', borderRadius: '8px', padding: '0 16px', color: '#FFF', fontSize: '14px' }}
              />
            </div>

            {/* Players Table */}
            <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0B193C', borderBottom: '1px solid #35589A', color: '#9BB1DB' }}>
                    <th style={{ padding: '12px 16px' }}>Full Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Phone Number</th>
                    <th style={{ padding: '12px 16px' }}>Progress</th>
                    <th style={{ padding: '12px 16px' }}>Prize Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Staff Action</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1E376D' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{p.fullName}</td>
                      <td style={{ padding: '12px 16px' }}>{p.email}</td>
                      <td style={{ padding: '12px 16px' }}>{p.phoneNumber}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {p.isCompleted ? (
                          <span style={{ color: '#8CE63D', fontWeight: 700 }}>✅ Completed 100%</span>
                        ) : (
                          <span style={{ color: '#FEC949' }}>Stage {p.currentSequenceOrder} / 4</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {p.isPrizeCollected ? (
                          <span style={{ color: '#8CE63D', fontWeight: 700 }}>🎁 Collected</span>
                        ) : (
                          <span style={{ color: '#9BB1DB' }}>Pending Claim</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {p.isPrizeCollected ? (
                          <button disabled style={{ background: '#35589A', color: '#9BB1DB', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'not-allowed', fontSize: '12px' }}>
                            Prize Collected
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPrizeCollected(p.id)}
                            disabled={!p.isCompleted}
                            style={{
                              background: p.isCompleted ? '#FEC949' : '#35589A',
                              color: p.isCompleted ? '#1B3774' : '#9BB1DB',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: p.isCompleted ? 'pointer' : 'not-allowed',
                              fontSize: '12px'
                            }}
                          >
                            Mark Prize as Collected
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9BB1DB' }}>
                        No players matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Venue Poster QR Generator */}
        {activeTab === 'QR_PRINTER' && (
          <div>
            <h2 style={{ color: '#FEC949', marginBottom: '16px' }}>Physical Venue Poster QR Code Generator</h2>
            <p style={{ color: '#9BB1DB', fontSize: '13px', marginBottom: '24px' }}>
              Staff Admin-only tool for printing physical signage QRs placed throughout the venue.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Main Booth QR */}
              <div style={{ background: '#152B5B', border: '1.5px solid #FEC949', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <h3 style={{ color: '#FEC949', fontSize: '16px', marginBottom: '8px' }}>📍 Main Booth Registration QR</h3>
                <p style={{ color: '#9BB1DB', fontSize: '12px', marginBottom: '16px' }}>Placed at Main Exhibition Booth #A-12</p>
                <div style={{ background: '#FFF', padding: '16px', display: 'inline-block', borderRadius: '12px', marginBottom: '12px' }}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=http://192.168.100.92:3000/scan?token=token-main-booth" alt="Main Booth QR" width="160" height="160" />
                </div>
                <div style={{ fontSize: '11px', color: '#9BB1DB', wordBreak: 'break-all' }}>URL: http://192.168.100.92:3000/scan?token=token-main-booth</div>
              </div>

              {/* Store Sequence QRs */}
              {sequence.map(s => (
                <div key={s.sequenceId} style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ color: '#FFF', fontSize: '15px', marginBottom: '4px' }}>Store {s.sequenceOrder}: {s.store.nameEn}</h3>
                  <div style={{ fontSize: '12px', color: '#FEC949', marginBottom: '12px' }}>Game: {s.gameKey}</div>
                  <div style={{ background: '#FFF', padding: '16px', display: 'inline-block', borderRadius: '12px', marginBottom: '12px' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=http://192.168.100.92:3000/scan?token=${encodeURIComponent(s.qrToken)}`} alt={`Store ${s.sequenceOrder} QR`} width="160" height="160" />
                  </div>
                  <div style={{ fontSize: '11px', color: '#9BB1DB', wordBreak: 'break-all' }}>Token: {s.qrToken}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'AUDIT' && (
          <div>
            <h2 style={{ color: '#FEC949', marginBottom: '16px' }}>Staff Activity Audit Logs</h2>
            <div style={{ background: '#152B5B', border: '1px solid #35589A', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0B193C', color: '#9BB1DB' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                    <th style={{ padding: '12px 16px' }}>Staff Admin</th>
                    <th style={{ padding: '12px 16px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #1E376D' }}>
                      <td style={{ padding: '12px 16px' }}>{new Date(l.created_at).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#8CE63D' }}>{l.action}</td>
                      <td style={{ padding: '12px 16px' }}>{l.admin_id}</td>
                      <td style={{ padding: '12px 16px' }}>{JSON.stringify(l.details)}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9BB1DB' }}>No audit log entries recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
