import React, { useEffect, useState } from 'react';
import api from '../api';
import { ShoppingCart, Plus, Trash2, Pencil, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const CommandesV2 = () => {
    const [commandes, setCommandes] = useState([]);
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [productServiceStatus, setProductServiceStatus] = useState('checking'); // 'up', 'down'

    const [formData, setFormData] = useState({
        description: '',
        quantite: 1,
        idProduit: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [fallbackResult, setFallbackResult] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Charger les commandes (Service V2)
            try {
                const cmdsRes = await api.get('/v2/commandes');
                setCommandes(cmdsRes.data);
            } catch (e) {
                setError("Le Microservice Commandes V2 est indisponible. Vérifiez qu'il est lancé sur le port 8083.");
                setLoading(false);
                return;
            }

            // 2. Charger les produits (Service Produit) - Optionnel pour ne pas bloquer l'UI
            try {
                const prodsRes = await api.get('/produits');
                setProduits(prodsRes.data);
                setProductServiceStatus('up');
            } catch (e) {
                console.warn("Service Produit indisponible (normal pour test fallback)");
                setProductServiceStatus('down');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const produit = produits.find(p => p.id === parseInt(formData.idProduit));
            const montant = produit ? produit.prix * formData.quantite : 0;
            const payload = { ...formData, montant: montant };

            if (isEditing) {
                await api.put(`/v2/commandes/${currentId}`, payload);
            } else {
                await api.post('/v2/commandes', payload);
            }
            closeModal();
            fetchData();
        } catch (err) {
            alert("Erreur lors de l'enregistrement. Vérifiez la console.");
        }
    };

    const handleTestFallback = async (id) => {
        setFallbackResult({ id, status: 'loading' });
        try {
            // CET APPEL utilise le @CircuitBreaker dans le backend
            const res = await api.get(`/v2/commandes/${id}`);
            const data = res.data;

            // On vérifie si Resilience4j a activé le fallback (nom contient "Fallback")
            const isFallback = data.produit?.nom?.includes("Fallback");

            setFallbackResult({
                id,
                status: 'done',
                isFallback,
                productName: data.produit?.nom || 'Inconnu',
                montant: data.montant
            });
        } catch (e) {
            setFallbackResult({ id, status: 'error', message: e.message });
        }
    };

    const openEditModal = (cmd) => {
        setFormData({
            description: cmd.description,
            quantite: cmd.quantite,
            idProduit: cmd.idProduit,
            date: cmd.date
        });
        setIsEditing(true);
        setCurrentId(cmd.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ description: '', quantite: 1, idProduit: '', date: new Date().toISOString().split('T')[0] });
        setIsEditing(false);
        setCurrentId(null);
        setFallbackResult(null);
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette commande V2 ?")) return;
        try {
            await api.delete(`/v2/commandes/${id}`);
            fetchData();
        } catch (err) {
            alert("Erreur suppression");
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header avec Statut des Services */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Commandes V2</h1>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> V2: Online (8083)
                        </span>
                        <span style={{
                            fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px',
                            backgroundColor: productServiceStatus === 'up' ? '#dcfce7' : '#fee2e2',
                            color: productServiceStatus === 'up' ? '#166534' : '#991b1b',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            {productServiceStatus === 'up' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                            Produit: {productServiceStatus === 'up' ? 'Online (8082)' : 'OFFLINE (Test Fallback prêt)'}
                        </span>
                    </div>
                </div>
                <button onClick={() => { setIsEditing(false); setFormData({ description: '', quantite: 1, idProduit: '', date: new Date().toISOString().split('T')[0] }); setShowModal(true); }} style={{ backgroundColor: '#db2777', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Plus size={20} /> Nouvelle Commande
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
                    {error}
                </div>
            )}

            {/* Aide au test de fallback */}
            {productServiceStatus === 'down' && (
                <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#9a3412' }}>
                    <h4 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Mode Test Fallback Activé</h4>
                    <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                        Le Microservice Produit est éteint. Cliquez sur <strong>"Tester Fallback"</strong> dans le tableau pour voir Resilience4j agir en temps réel.
                    </p>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#fdf2f8', borderBottom: '1px solid #fbcfe8' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#831843' }}>ID</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Description</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Produit (Ref)</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Quantité</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Montant</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Date</th>
                            <th style={{ padding: '16px', color: '#831843', textAlign: 'center' }}>Actions / Resilience4j</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commandes.map((cmd) => (
                            <tr key={cmd.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px' }}>#{cmd.id}</td>
                                <td style={{ padding: '16px' }}>{cmd.description}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ backgroundColor: '#fce7f3', color: '#be185d', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>
                                        Produit #{cmd.idProduit}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{cmd.quantite}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{cmd.montant} DH</td>
                                <td style={{ padding: '16px', color: '#6b7280' }}>{cmd.date}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleTestFallback(cmd.id)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: '1px solid #db2777',
                                                backgroundColor: fallbackResult?.id === cmd.id ? '#db2777' : 'white',
                                                color: fallbackResult?.id === cmd.id ? 'white' : '#db2777',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                                            }}
                                        >
                                            <Activity size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                            {fallbackResult?.id === cmd.id && fallbackResult.status === 'loading' ? 'Appel...' : 'Tester Fallback'}
                                        </button>

                                        <button onClick={() => openEditModal(cmd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} title="Modifier">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(cmd.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Supprimer">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {fallbackResult?.id === cmd.id && fallbackResult.status === 'done' && (
                                        <div style={{
                                            marginTop: '8px', fontSize: '0.75rem', padding: '8px', borderRadius: '6px',
                                            backgroundColor: fallbackResult.isFallback ? '#fff1f2' : '#f0fdf4',
                                            color: fallbackResult.isFallback ? '#9f1239' : '#166534',
                                            border: '1px solid ' + (fallbackResult.isFallback ? '#fda4af' : '#bbf7d0')
                                        }}>
                                            <strong>{fallbackResult.isFallback ? "FALLBACK ACTIVÉ" : "OK"}</strong>: {fallbackResult.productName}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {commandes.length === 0 && (
                            <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Aucune commande. Ajoutez-en une !</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>{isEditing ? 'Modifier Commande V2' : 'Nouvelle Commande V2'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input type="text" placeholder="Description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Sélectionner Produit :</label>
                                {productServiceStatus === 'up' ? (
                                    <select
                                        required
                                        value={formData.idProduit}
                                        onChange={e => setFormData({ ...formData, idProduit: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    >
                                        <option value="">-- Choisir un produit --</option>
                                        {produits.map(p => (<option key={p.id} value={p.id}>{p.nom} ({p.prix} DH)</option>))}
                                    </select>
                                ) : (
                                    <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                                        ⚠️ Service Produit indisponible.
                                        {isEditing ? ` (Conservé: Produit #${formData.idProduit})` : " Impossible de créer une commande sans catalogue."}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Quantité :</label>
                                    <input type="number" min="1" required value={formData.quantite} onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Date :</label>
                                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'f9fafb', cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" disabled={!isEditing && productServiceStatus === 'down'} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#db2777', color: 'white', cursor: 'pointer', opacity: (!isEditing && productServiceStatus === 'down') ? 0.5 : 1 }}>
                                    {isEditing ? 'Mettre à jour' : 'Créer la commande'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommandesV2;
