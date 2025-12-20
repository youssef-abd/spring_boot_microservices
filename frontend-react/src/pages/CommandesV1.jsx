import React, { useEffect, useState } from 'react';
import api from '../api';
import { Clock, Plus, Loader, RefreshCw, Trash2, Pencil } from 'lucide-react';

const CommandesV1 = () => {
    const [commandes, setCommandes] = useState([]);
    const [recentes, setRecentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'recent'

    const [formData, setFormData] = useState({
        description: '',
        quantite: 1,
        montant: 0,
        date: new Date().toISOString().split('T')[0]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // On tente de récupérer les commandes
            try {
                const allRes = await api.get('/v1/commandes/all');
                setCommandes(allRes.data);
            } catch (e) {
                console.error("Erreur chargement commandes:", e);
                throw new Error("Impossible de charger les commandes (Vérifiez que le Microservice V1 est UP)");
            }

            // On tente de récupérer les récentes (peut échouer si config mal chargée)
            try {
                const recentRes = await api.get('/v1/commandes/recent');
                setRecentes(recentRes.data);
            } catch (e) {
                console.warn("Erreur chargement récentes (Endpoint /recent):", e);
                // On ne bloque pas si juste ça échoue, mais on le signale
                setRecentes([]);
            }

        } catch (err) {
            setError(err.message || 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/v1/commandes/${currentId}`, formData);
            } else {
                await api.post('/v1/commandes', formData);
            }
            closeModal();
            fetchData();
        } catch (err) {
            alert("Erreur lors de l'enregistrement");
        }
    };

    const openEditModal = (cmd) => {
        setFormData({
            description: cmd.description,
            quantite: cmd.quantite || 1,
            montant: cmd.montant,
            date: cmd.date
        });
        setIsEditing(true);
        setCurrentId(cmd.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ description: '', quantite: 1, montant: 0, date: new Date().toISOString().split('T')[0] });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette commande ?")) return;
        try {
            await api.delete(`/v1/commandes/${id}`);
            fetchData();
        } catch (err) {
            alert("Erreur suppression commande");
        }
    };

    const refreshConfig = async () => {
        if (confirm("Voulez-vous forcer le rechargement de la configuration (Actuator Refresh) ?")) {
            try {
                // Note: Actuator est souvent sur le port direct du service (8081) et pas via Gateway, 
                // sauf si configuré. On tente via Gateway si on a routé, sinon on prévient.
                // Ici on suppose que le user le fait manuellement ou que j'ai routé actuator (ce que je n'ai pas fait explicitement).
                // Pour la démo UI, on se contente de recharger la liste "Recent".
                fetchData();
                alert("Données rafraîchies. Pour changer la durée (10/20 jours), modifiez le repo Git et faites un POST sur /actuator/refresh");
            } catch (e) { console.error(e); }
        }
    };

    const currentList = activeTab === 'all' ? commandes : recentes;

    if (loading) return <div className="p-8 text-center"><Loader className="animate-spin inline" /> Chargement...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Commandes V1</h1>
                    <p style={{ color: '#6b7280' }}>Étude de Cas 1 : CRUD Classique & Config Dynamique</p>
                </div>
                <button
                    onClick={() => { setIsEditing(false); setFormData({ description: '', quantite: 1, montant: 0, date: new Date().toISOString().split('T')[0] }); setShowModal(true); }}
                    style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Nouvelle
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
                    <strong>Erreur :</strong> {error}
                </div>
            )}

            {/* Onglets pour démontrer la Feature "Commandes Récentes" */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{
                        padding: '12px 24px',
                        borderBottom: activeTab === 'all' ? '2px solid #4f46e5' : 'none',
                        color: activeTab === 'all' ? '#4f46e5' : '#6b7280',
                        fontWeight: '600',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Toutes les commandes
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    style={{
                        padding: '12px 24px',
                        borderBottom: activeTab === 'recent' ? '2px solid #4f46e5' : 'none',
                        color: activeTab === 'recent' ? '#4f46e5' : '#6b7280',
                        fontWeight: '600',
                        background: 'none',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Clock size={16} /> Commandes Récentes (Config)
                </button>
            </div>

            {activeTab === 'recent' && (
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#1e40af', fontSize: '0.9rem' }}>
                    ℹ️ Cette liste est filtrée par la propriété <strong>mes-config-ms.commandes-last</strong> du Config Server.
                    <br />Changez la valeur dans GitHub (10 -&gt; 20) et rafraîchissez Actuator pour voir la différence.
                    <button onClick={fetchData} style={{ marginLeft: '12px', textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <RefreshCw size={12} style={{ display: 'inline' }} /> Actualiser la liste
                    </button>
                </div>
            )}

            {/* Tableau */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Montant</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentList.map(cmd => (
                            <tr key={cmd.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px' }}>#{cmd.id}</td>
                                <td style={{ padding: '16px' }}>{cmd.description}</td>
                                <td style={{ padding: '16px' }}>{cmd.date}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{cmd.montant} DH</td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => openEditModal(cmd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', marginRight: '10px' }} title="Modifier">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(cmd.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Supprimer">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentList.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Aucune commande dans cette vue</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Création */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '400px' }}>
                        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: 'bold' }}>{isEditing ? 'Modifier Commande' : 'Nouvelle Commande V1'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input type="number" placeholder="Montant" value={formData.montant} onChange={e => setFormData({ ...formData, montant: parseFloat(e.target.value) })} required style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" style={{ flex: 1, padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isEditing ? 'Mettre à jour' : 'Créer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommandesV1;
