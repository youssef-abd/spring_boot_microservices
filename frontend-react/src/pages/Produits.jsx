import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, Loader, Plus, Trash2 } from 'lucide-react';

const Produits = () => {
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nom: '', prix: '' });

    useEffect(() => {
        fetchProduits();
    }, []);

    const fetchProduits = async () => {
        try {
            const response = await api.get('/produits');
            setProduits(response.data);
        } catch (err) {
            setError('Impossible de charger les produits.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/produits', { nom: formData.nom, prix: parseFloat(formData.prix) });
            setShowModal(false);
            setFormData({ nom: '', prix: '' });
            fetchProduits();
        } catch (err) {
            alert("Erreur création produit");
        }
    };


    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
        try {
            await api.delete(`/produits/${id}`);
            fetchProduits(); // Rafraichir la liste
        } catch (err) {
            alert("Erreur lors de la suppression. Vérifiez que ce produit n'est pas utilisé dans une commande V2 (clé étrangère).");
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader className="animate-spin inline" /> Chargement...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Produits</h1>
                    <p style={{ color: '#6b7280' }}>Catalogue Produits</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Nouveau Produit
                </button>
            </header>

            {error && <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                {produits.map((produit) => (
                    <div key={produit.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '8px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}><Package size={20} /></div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4f46e5' }}>{produit.prix} DH</span>
                            </div>
                            <button
                                onClick={() => handleDelete(produit.id)}
                                style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>{produit.nom}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Reference #{produit.id}</p>
                    </div>
                ))}
                {produits.length === 0 && <p style={{ color: '#6b7280' }}>Aucun produit. Ajoutez-en un !</p>}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '350px' }}>
                        <h2 style={{ marginBottom: '16px', fontWeight: 'bold' }}>Ajouter Produit</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input placeholder="Nom du produit" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input type="number" step="0.01" placeholder="Prix" value={formData.prix} onChange={e => setFormData({ ...formData, prix: e.target.value })} required style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                                <button type="submit" style={{ flex: 1, padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Produits;
