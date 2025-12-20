import React, { useEffect, useState } from 'react';
import api from '../api';
import { ShoppingCart, Plus, Check, AlertTriangle } from 'lucide-react';

const Commandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [produits, setProduits] = useState([]);

    // Form state
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
        try {
            // On récupère toutes les commandes V2
            // Comme l'API ne renvoie pas une liste complète avec produits pour getAll (seulement getById a le circuit breaker complet details)
            // On va d'abord récupérer la liste brute puis les détails si besoin.
            // NOTE: Dans votre backend, CommandeController.getAll retourne une List<Commande> simple sans produit.
            // Pour une vraie UI, il faudrait un endpoint qui retourne les détails.
            // Pour simplifier ici, on va afficher la liste simple, et si on clique, on charge le détail.
            // ATTENTION: Le backend getAll retourne juste l'entité Commande.

            const [cmdsRes, prodsRes] = await Promise.all([
                api.get('/v2/commandes'),
                api.get('/produits')
            ]);

            setCommandes(cmdsRes.data);
            setProduits(prodsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Trouver le produit pour avoir le prix
            const produit = produits.find(p => p.id === parseInt(formData.idProduit));
            const montant = produit ? produit.prix * formData.quantite : 0;

            const payload = {
                ...formData,
                montant: montant
            };

            await api.post('/v2/commandes', payload);
            setShowModal(false);
            fetchData(); // Rafraîchir
            setFormData({ description: '', quantite: 1, idProduit: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            alert('Erreur lors de la création');
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Commandes</h1>
                    <p style={{ color: '#6b7280' }}>Historique des commandes (Service V2)</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={20} /> Nouvelle Commande
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>ID</th>
                            <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Description</th>
                            <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Produit (ID)</th>
                            <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Quantité</th>
                            <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Montant</th>
                            <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commandes.map((cmd) => (
                            <tr key={cmd.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px' }}>#{cmd.id}</td>
                                <td style={{ padding: '16px', fontWeight: '500' }}>{cmd.description}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        backgroundColor: '#e0e7ff',
                                        color: '#4338ca',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '0.875rem'
                                    }}>
                                        Produit #{cmd.idProduit}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{cmd.quantite}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{cmd.montant} €</td>
                                <td style={{ padding: '16px', color: '#6b7280' }}>{cmd.date}</td>
                            </tr>
                        ))}
                        {commandes.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                    Aucune commande trouvée
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE CREATION */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Nouvelle Commande</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Produit</label>
                                <select
                                    required
                                    value={formData.idProduit}
                                    onChange={e => setFormData({ ...formData, idProduit: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                >
                                    <option value="">Sélectionner un produit...</option>
                                    {produits.map(p => (
                                        <option key={p.id} value={p.id}>{p.nom} - {p.prix} €</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Quantité</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.quantite}
                                        onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600' }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white', fontWeight: '600' }}
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Commandes;
