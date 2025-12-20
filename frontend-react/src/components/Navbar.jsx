import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Activity, Layers, Clock } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Aperçu', icon: Home },
        { path: '/produits', label: 'Produits', icon: Package },
        { path: '/commandes-v1', label: 'Commandes V1 (Simple)', icon: Clock },
        { path: '/commandes-v2', label: 'Commandes V2 (Produits)', icon: ShoppingCart },
    ];

    return (
        <nav style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 24px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Layers size={28} color="#4f46e5" />
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
                    Gestion<span style={{ color: '#4f46e5' }}>Articles</span>
                </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: location.pathname === item.path ? '#4f46e5' : '#6b7280',
                            backgroundColor: location.pathname === item.path ? '#eef2ff' : 'transparent',
                            fontWeight: location.pathname === item.path ? 600 : 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
