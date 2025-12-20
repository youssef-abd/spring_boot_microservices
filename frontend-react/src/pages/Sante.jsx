import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Direct axios call might be needed if Gateway doesn't expose Actuator cleanly logic
import { Activity, CheckCircle, XCircle } from 'lucide-react';

const Sante = () => {
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(true);

    // Note: En prod, actuator est souvent protégé. Ici on assume que le port 8081 est accessible ou via Gateway
    // Ici on va tricher un peu pour la démo UI : on va faire des appels directs aux ports si on est en localhost,
    // ou via la gateway si possible.
    // Pour la robustesse, on va essayer via Gateway (qui n'a pas forcément configuré actuator route)
    // MAIS: dans le script start_clean, on expose les ports 8081, 8082, 8083. Donc on peut les appeler directement depuis le navigateur du client.

    const services = [
        { name: 'Commandes V1', url: 'http://localhost:8081/actuator/health' },
        { name: 'Produits', url: 'http://localhost:8082/actuator/health' },
        { name: 'Commandes V2', url: 'http://localhost:8083/actuator/health' },
        { name: 'Gateway', url: 'http://localhost:8080/actuator/health' }
    ];

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        const results = {};
        await Promise.all(services.map(async (svc) => {
            try {
                const res = await axios.get(svc.url);
                results[svc.name] = res.data;
            } catch (e) {
                results[svc.name] = { status: 'DOWN', error: 'Inaccessible' };
            }
        }));
        setStatuses(results);
        setLoading(false);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>État des Services</h1>

            <div style={{ display: 'grid', gap: '16px' }}>
                {services.map((svc) => {
                    const statusData = statuses[svc.name] || { status: 'UNKNOWN' };
                    const isUp = statusData.status === 'UP';

                    return (
                        <div key={svc.name} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `6px solid ${isUp ? '#22c55e' : '#ef4444'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{svc.name}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{svc.url}</p>

                                {/* Custom Health Check Display for V1 */}
                                {svc.name === 'Commandes V1' && statusData.components?.commande && (
                                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                                        Custom Check: {statusData.components.commande.details?.message}
                                        (Count: {statusData.components.commande.details?.count})
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isUp ? '#15803d' : '#b91c1c', fontWeight: 'bold', backgroundColor: isUp ? '#dcfce7' : '#fee2e2', padding: '8px 16px', borderRadius: '20px' }}>
                                {isUp ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                {statusData.status}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sante;
