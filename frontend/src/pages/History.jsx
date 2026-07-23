import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, VideoOff, Trash2 } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [selectedRawData, setSelectedRawData] = useState(null);
  const navigate = useNavigate();

  const handleDeleteSingle = async (recordId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interview record?")) return;

    // 1. Update local state and localStorage
    const updated = history.filter(item => item.id !== recordId);
    setHistory(updated);
    localStorage.setItem('interviewHistory', JSON.stringify(updated));

    // 2. Delete from Firestore in background
    try {
      const { db } = await import('../firebase.js');
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "interviews", recordId));
    } catch (err) {
      console.warn("Firestore record delete notice:", err);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear ALL stored interview history? This cannot be undone.")) return;

    // 1. Clear local state and localStorage
    setHistory([]);
    localStorage.removeItem('interviewHistory');

    // 2. Clear Firestore collection documents for this user
    try {
      const { db, auth } = await import('../firebase.js');
      const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');

      const userEmail = (auth.currentUser?.email || localStorage.getItem('userEmail'))?.toLowerCase();
      const userId = auth.currentUser?.uid || localStorage.getItem('userId');

      if (userEmail) {
        const q = query(collection(db, "interviews"), where("userEmail", "==", userEmail));
        const snap = await getDocs(q);
        snap.docs.forEach(async (d) => {
          await deleteDoc(doc(db, "interviews", d.id));
        });
      } else if (userId) {
        const q = query(collection(db, "interviews"), where("userId", "==", userId));
        const snap = await getDocs(q);
        snap.docs.forEach(async (d) => {
          await deleteDoc(doc(db, "interviews", d.id));
        });
      }
    } catch (err) {
      console.warn("Firestore clear all notice:", err);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    async function loadHistory() {
      // 1. Load local history immediately so the user sees results right away
      const localHistory = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
      localHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(localHistory);

      // 2. Merge Firestore data when available (query by userEmail or userId)
      try {
        const { db, auth } = await import('../firebase.js');
        const { collection, query, where, getDocs } = await import('firebase/firestore');

        const userEmail = (auth.currentUser?.email || localStorage.getItem('userEmail'))?.toLowerCase();
        const userId = auth.currentUser?.uid || localStorage.getItem('userId');

        let dbData = [];
        if (userEmail) {
          try {
            const q = query(collection(db, "interviews"), where("userEmail", "==", userEmail));
            const snap = await getDocs(q);
            dbData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const qCoding = query(collection(db, "coding_submissions"), where("userEmail", "==", userEmail));
            const snapCoding = await getDocs(qCoding);
            const codingDocs = snapCoding.docs.map(doc => ({
              id: doc.id,
              type: 'coding_challenge',
              domain: `💻 Coding: ${doc.data().questionTitle}`,
              ...doc.data()
            }));
            dbData = [...dbData, ...codingDocs];
          } catch (e) {}
        }

        if (dbData.length === 0 && userId) {
          try {
            const q = query(collection(db, "interviews"), where("userId", "==", userId));
            const snap = await getDocs(q);
            dbData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const qCoding = query(collection(db, "coding_submissions"), where("userId", "==", userId));
            const snapCoding = await getDocs(qCoding);
            const codingDocs = snapCoding.docs.map(doc => ({
              id: doc.id,
              type: 'coding_challenge',
              domain: `💻 Coding: ${doc.data().questionTitle}`,
              ...doc.data()
            }));
            dbData = [...dbData, ...codingDocs];
          } catch (e) {}
        }

        if (dbData.length > 0) {
          const currentLocal = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
          const merged = [...dbData];
          currentLocal.forEach(localItem => {
            if (!merged.some(dbItem => dbItem.id === localItem.id || dbItem.date === localItem.date)) {
              merged.push(localItem);
            }
          });

          merged.sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(merged);
          localStorage.setItem('interviewHistory', JSON.stringify(merged));
        }
      } catch (err) {
        console.warn("Web Firestore history load notice:", err);
      }
    }

    loadHistory();
    return () => unsubscribe();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Interview History & Database</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
            Stored interview metrics across 5 sector categories synced with Firebase Cloud Firestore.
          </p>
        </div>
        {history.length > 0 && (
          <button
            className="btn-secondary"
            onClick={handleClearAllHistory}
            style={{
              borderColor: 'var(--danger)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            <Trash2 size={16} /> Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <VideoOff size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem auto', display: 'block' }} />
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>No Stored Interviews Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You have not taken any interviews yet. Complete your first interview to store data in the database!
          </p>
          <button className="btn-primary" onClick={() => navigate('/interviews')}>
            Start an Interview
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {history.map((record) => {
            const scoreColor = getScoreColor(record.scores?.overall || 0);
            const formattedDate = new Date(record.date).toLocaleDateString(undefined, {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            });
            const formattedTime = new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={record.id}
                style={{
                  padding: '1.5rem',
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-color)',
                  borderLeft: '4px solid ' + scoreColor,
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Overall Score</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: scoreColor }}>
                        {record.scores?.overall || 0}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.4rem 0', color: '#fff' }}>{record.domain}</h3>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} /> {formattedDate}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={14} /> {formattedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedRawData(record)}
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      View Database JSON
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => navigate('/interview/result/' + record.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      View Full Analysis <ChevronRight size={16} />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={(e) => handleDeleteSingle(record.id, e)}
                      title="Delete Record"
                      style={{
                        padding: '0.5rem 0.9rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        borderColor: '#EF4444',
                        color: '#EF4444',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                {/* 5 Sector Scores Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1rem))',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🧠 Knowledge</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(record.scores?.contentKnowledge || 0) }}>
                      {record.scores?.contentKnowledge || 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>💬 Communication</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(record.scores?.communication || 0) }}>
                      {record.scores?.communication || 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>👁️ Confidence</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(record.scores?.confidence || 0) }}>
                      {record.scores?.confidence || 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>⚡ Fluency</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(record.scores?.fluency || 0) }}>
                      {record.scores?.fluency || 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🎯 STAR Structure</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(record.scores?.answerStructure || 0) }}>
                      {record.scores?.answerStructure || 0}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raw Database JSON Viewer Modal */}
      {selectedRawData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>💾 Stored Database Record JSON</h3>
              <button className="btn-secondary" onClick={() => setSelectedRawData(null)} style={{ padding: '0.3rem 0.7rem' }}>Close</button>
            </div>
            <pre style={{
              flex: 1, padding: '1.5rem', margin: 0, overflow: 'auto', background: '#0b0f19',
              color: '#10B981', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5'
            }}>
              {JSON.stringify(selectedRawData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
