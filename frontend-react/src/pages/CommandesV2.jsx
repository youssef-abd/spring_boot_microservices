import React, { useEffect, useState } from 'react';
import api from '../api';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';

const CommandesV2 = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [produits, setProduits] = useState([]);

    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        quantite: 1,
        idProduit: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        console.log("Fetching V2 data...");
        setLoading(true);
        setError(null);
        try {
            // Chargement indépendant pour voir ce qui plante
            try {
                const cmdsRes = await api.get('/v2/commandes'); // Gateway route for V2
                console.log("Commandes reçues:", cmdsRes.data);
                setCommandes(cmdsRes.data);
            } catch (e) {
                console.error("Erreur chargement commandes V2:", e);
                throw new Error("Erreur API Commandes V2: " + e.message);
            }

            try {
                const prodsRes = await api.get('/produits');
                console.log("Produits reçus:", prodsRes.data);
                setProduits(prodsRes.data);
            } catch (e) {
                console.error("Erreur chargement produits:", e);
                throw new Error("Erreur API Produits: " + e.message);
            }

        } catch (err) {
            console.error("Global fetch error:", err);
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

            await api.post('/v2/commandes', payload);
            setShowModal(false);
            fetchData();
            setFormData({ description: '', quantite: 1, idProduit: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            alert('Erreur lors de la création');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette commande V2 ?")) return;
        try {
            await api.delete(`/v2/commandes/${id}`);
            fetchData();
        } catch (err) {
            alert("Erreur suppression commande V2");
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Commandes V2</h1>
                    <p style={{ color: '#6b7280' }}>Étude de Cas 2 : Association Produit & Circuit Breaker</p>
                </div>
                <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#db2777', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Plus size={20} /> Nouvelle Commande V2
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
                    <strong>Erreur de chargement :</strong> {error}
                    <br />
                    <small>Vérifiez la console (F12) pour plus de détails. Assurez-vous que la Gateway et les microservices sont lancés.</small>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#fdf2f8', borderBottom: '1px solid #fbcfe8' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#831843' }}>ID</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Description</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Produit (ID)</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Quantité</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Montant</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Date</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Date</th>
                            <th style={{ padding: '16px', color: '#831843' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commandes.map((cmd) => (
                            <tr key={cmd.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px' }}>#{cmd.id}</td>
                                <td style={{ padding: '16px' }}>{cmd.description}</td>
                                <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#fce7f3', color: '#be185d', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>Produit #{cmd.idProduit}</span></td>
                                <td style={{ padding: '16px' }}>{cmd.quantite}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{cmd.montant} DH</td>
                                <td style={{ padding: '16px', color: '#6b7280' }}>{cmd.date}</td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => handleDelete(cmd.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be185d' }} title="Supprimer">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Nouvelle Commande V2</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input type="text" placeholder="Description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                            <div style={{ marginBottom: '8px' }}>
                                {produits.length > 0 ? (
                                    <select
                                        required
                                        value={formData.idProduit}
                                        onChange={e => setFormData({ ...formData, idProduit: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    >
                                        <option value="">Sélectionner un produit...</option>
                                        {produits.map(p => (<option key={p.id} value={p.id}>{p.nom} - {p.prix} DH</option>))}
                                    </select>
                                ) : (
                                    <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        ⚠️ Aucun produit disponible.
                                        <br />
                                        <a href="/produits" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Aller créer un produit</a> d'abord.
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <input type="number" min="1" placeholder="Quantité" required value={formData.quantite} onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white' }}>Annuler</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#db2777', color: 'white' }}>Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommandesV2;
