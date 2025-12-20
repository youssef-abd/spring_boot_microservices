import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, ShoppingBag, Server } from 'lucide-react';

const Dashboard = () => {
    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(to right, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
                    MicroServices Manager
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                    Interface centralisée pour la gestion de votre architecture distribuée.
                    Gérez vos produits et commandes via l'API Gateway unifiée.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

                {/* CARTE PRODUITS */}
                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <Box color="#4f46e5" size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>Catalogue Produits</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        Consultez et gérez l'inventaire des produits disponibles via le Microservice Produit.
                    </p>
                    <Link to="/produits" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: '600' }}>
                        Accéder au catalogue <ArrowRight size={16} />
                    </Link>
                </div>

                {/* CARTE COMMANDES */}
                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#fce7f3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <ShoppingBag color="#db2777" size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>Gestion Commandes</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        Suivi des commandes clients et création de nouvelles ventes via le Microservice Commandes V2.
                    </p>
                    <Link to="/commandes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#db2777', fontWeight: '600' }}>
                        Gérer les commandes <ArrowRight size={16} />
                    </Link>
                </div>

                {/* CARTE INFRASTRUCTURE */}
                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s', opacity: 0.8 }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <Server color="#16a34a" size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>Infrastructure</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        Statut des services via Eureka et Actuator. (Consultation uniquement)
                    </p>
                    <a href="http://localhost:8761" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '600' }}>
                        Ouvrir Eureka <ArrowRight size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
