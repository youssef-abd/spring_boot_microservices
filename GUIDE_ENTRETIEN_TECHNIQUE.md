# Guide d'Entretien Technique - Projet Microservices JEE

## 📋 Vue d'Ensemble du Projet

### Contexte
Ce projet implémente une **architecture microservices complète** utilisant Spring Boot 3 et Spring Cloud pour gérer un système de commandes et de produits. Il démontre les patterns et pratiques essentiels des architectures distribuées modernes.

### Technologies Utilisées
- **Framework**: Spring Boot 3.2.3
- **Cloud**: Spring Cloud 2023.0.0
- **Java**: 17
- **Base de données**: H2 (in-memory)
- **Build**: Maven
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Configuration**: Spring Cloud Config
- **Circuit Breaker**: Resilience4j
- **Communication**: OpenFeign
- **Documentation**: SpringDoc OpenAPI (Swagger)

---

## 🏗️ Architecture Détaillée

### Composants du Système

```
┌─────────────────────────────────────────────────────────────┐
│                        Client / Postman                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Gateway :8080  │ ◄──── Point d'entrée unique
                  └────────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│ Commandes V1  │  │ Commandes V2 │  │   Produit    │
│    :8081      │  │    :8083     │  │    :8082     │
└───────────────┘  └──────┬───────┘  └──────────────┘
                          │
                          │ Feign Client
                          │ + Circuit Breaker
                          └──────────────────────────►
                          
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
┌───────────────┐                    ┌──────────────┐
│ Eureka :8761  │                    │ Config :8888 │
│ (Discovery)   │                    │ (Config Srv) │
└───────────────┘                    └──────────────┘
                                             │
                                             ▼
                                     ┌──────────────┐
                                     │ GitHub Repo  │
                                     │ (Config)     │
                                     └──────────────┘
```

---

## 🔍 Composants en Détail

### 1. Config Server (Port 8888)

**Rôle**: Centraliser la configuration de tous les microservices

**Pourquoi c'est important**:
- ✅ **Single Source of Truth**: Une seule source pour toutes les configurations
- ✅ **Environnements multiples**: Dev, Test, Prod avec des configs différentes
- ✅ **Modification à chaud**: Changement de config sans redéploiement
- ✅ **Sécurité**: Gestion centralisée des secrets

**Configuration**:
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/youssef-abd/jee-config-repo.git
          default-label: main
```

**Comment ça marche**:
1. Au démarrage, chaque microservice contacte le Config Server
2. Le Config Server récupère la configuration depuis Git
3. La configuration est injectée dans le microservice
4. Avec `@RefreshScope`, on peut recharger la config sans redémarrage

**Question d'entretien possible**: 
*"Que se passe-t-il si le Config Server est down au démarrage d'un microservice ?"*

**Réponse**: 
- Avec `fail-fast: true`, le microservice refuse de démarrer
- Avec `optional:configserver:`, le microservice démarre avec sa config locale
- En production, on utilise un cluster de Config Servers pour la haute disponibilité

---

### 2. Eureka Server (Port 8761)

**Rôle**: Service Registry - Annuaire de tous les microservices

**Pourquoi c'est important**:
- ✅ **Service Discovery**: Les services se trouvent automatiquement
- ✅ **Load Balancing**: Distribution automatique des requêtes
- ✅ **Résilience**: Détection automatique des services down
- ✅ **Scalabilité**: Ajout/suppression de services à la volée

**Configuration**:
```yaml
eureka:
  client:
    register-with-eureka: false  # Eureka ne s'enregistre pas lui-même
    fetch-registry: false
```

**Mécanisme d'enregistrement**:
1. Un microservice démarre
2. Il envoie un **heartbeat** toutes les 30 secondes à Eureka
3. Eureka marque le service comme "UP"
4. Les autres services peuvent le découvrir via le nom d'application

**Question d'entretien**: 
*"Comment Eureka sait-il qu'un service est down ?"*

**Réponse**:
- Si Eureka ne reçoit pas de heartbeat pendant 90 secondes, il marque le service comme DOWN
- Il y a un mécanisme de "self-preservation" pour éviter les faux positifs en cas de problème réseau
- Le service est automatiquement retiré du registry après expiration

---

### 3. Gateway Server (Port 8080)

**Rôle**: Point d'entrée unique (API Gateway Pattern)

**Pourquoi c'est important**:
- ✅ **Sécurité**: Un seul point à sécuriser (authentification, autorisation)
- ✅ **Routing**: Redirection intelligente vers les bons services
- ✅ **Cross-Cutting Concerns**: Logging, monitoring, rate limiting centralisés
- ✅ **Versioning**: Gestion des versions d'API

**Configuration des routes**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: commandes-v2
          uri: lb://MICROSERVICE-COMMANDES-V2  # lb = Load Balanced
          predicates:
            - Path=/api/v2/commandes/**
          filters:
            - RewritePath=/api/v2/commandes/(?<segment>.*), /commandes-v2/$\{segment}
```

**Explication du routing**:
- **Requête entrante**: `GET /api/v2/commandes/1`
- **Predicate**: Vérifie que le path commence par `/api/v2/commandes/`
- **Filter**: Réécrit le path en `/commandes-v2/1`
- **URI**: Cherche le service `MICROSERVICE-COMMANDES-V2` dans Eureka
- **Load Balancing**: Si plusieurs instances existent, distribue la charge

**Question d'entretien**:
*"Pourquoi utiliser `lb://` dans l'URI ?"*

**Réponse**:
- `lb://` active le **client-side load balancing** avec Spring Cloud LoadBalancer
- Au lieu d'une URL fixe (`http://localhost:8083`), on utilise le nom du service
- Spring Cloud LoadBalancer interroge Eureka pour obtenir toutes les instances disponibles
- Il distribue les requêtes selon l'algorithme (Round Robin par défaut)

---

### 4. Microservice Commandes V1 (Port 8081)

**Rôle**: Gestion CRUD des commandes (version simple)

**Fonctionnalités clés**:

#### a) CRUD sans SQL
```java
@RestController
@RequestMapping("/commandes")
public class CommandeController {
    private final CommandeRepository repository;  // JpaRepository
    
    @GetMapping
    public List<Commande> getAll() {
        return repository.findAll();  // Pas de SQL manuel !
    }
}
```

**Pourquoi Spring Data JPA**:
- ✅ Pas besoin d'écrire de SQL
- ✅ Méthodes générées automatiquement (`findAll`, `findById`, `save`, etc.)
- ✅ Requêtes personnalisées par convention de nommage

#### b) Configuration Dynamique avec @RefreshScope

```java
@Component
@ConfigurationProperties(prefix = "mes-config-ms")
@RefreshScope  // ← Permet le rechargement à chaud
@Data
public class CommandesConfig {
    private int commandesLast = 7;
}
```

**Scénario d'utilisation**:
1. Config initiale: `commandes-last: 10` (affiche commandes des 10 derniers jours)
2. Modification dans Git: `commandes-last: 20`
3. Appel à `/actuator/refresh` via POST
4. La nouvelle valeur est chargée **sans redémarrage**

**Question d'entretien**:
*"Que se passe-t-il avec les beans non-@RefreshScope lors d'un refresh ?"*

**Réponse**:
- Seuls les beans annotés `@RefreshScope` sont recréés
- Les autres beans conservent leurs anciennes valeurs
- C'est un mécanisme de **lazy refresh** pour éviter de tout recharger

#### c) Health Check Personnalisé

```java
@Component
public class CommandeHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        long count = repository.count();
        if (count > 0) {
            return Health.up()
                .withDetail("message", "Tables commandes non vide")
                .withDetail("count", count)
                .build();
        } else {
            return Health.down()
                .withDetail("message", "Table commandes vide")
                .build();
        }
    }
}
```

**Pourquoi personnaliser le Health Check**:
- ✅ **Monitoring métier**: Vérifier l'état fonctionnel, pas seulement technique
- ✅ **Kubernetes/Docker**: Utilisé pour les liveness/readiness probes
- ✅ **Alerting**: Déclenchement d'alertes si le service est "DOWN"

**Question d'entretien**:
*"Quelle est la différence entre liveness et readiness probe ?"*

**Réponse**:
- **Liveness**: "Le service est-il vivant ?" → Si non, Kubernetes le redémarre
- **Readiness**: "Le service est-il prêt à recevoir du trafic ?" → Si non, Kubernetes retire le pod du load balancer
- Notre Health Check peut servir pour les deux

---

### 5. Microservice Produit (Port 8082)

**Rôle**: Gestion des produits avec données pré-chargées

**Initialisation des données**:
```java
@Bean
CommandLineRunner start(ProduitRepository repo) {
    return args -> {
        repo.save(new Produit(null, "Laptop Dell", 1200.0));
        repo.save(new Produit(null, "Smartphone Samsung", 800.0));
        repo.save(new Produit(null, "Ecran 4K", 300.0));
    };
}
```

**Pourquoi CommandLineRunner**:
- S'exécute **après** le démarrage complet de Spring
- Idéal pour l'initialisation de données de test
- En production, on utiliserait Flyway ou Liquibase pour les migrations

**Controller simplifié**:
```java
@GetMapping("/{id}")
public Produit getById(@PathVariable("id") Long id) {
    System.out.println("=== GET BY ID CALLED: " + id);
    Optional<Produit> produit = repository.findById(id);
    if (produit.isPresent()) {
        return produit.get();
    }
    throw new RuntimeException("Produit non trouvé: " + id);
}
```

**Leçon apprise**: 
- Initialement, on utilisait `ResponseEntity<Produit>` mais cela causait des erreurs 500
- La version simple fonctionne mieux avec Feign
- **Principe KISS** (Keep It Simple, Stupid) s'applique !

---

### 6. Microservice Commandes V2 (Port 8083)

**Rôle**: Gestion des commandes avec appel inter-services

**Différence avec V1**:
- ✅ Chaque commande a un `idProduit`
- ✅ Appel au service Produit via **OpenFeign**
- ✅ Protection par **Circuit Breaker** (Resilience4j)

#### a) OpenFeign Client

```java
@FeignClient(name = "MICROSERVICE-PRODUIT")
public interface ProductClient {
    
    @GetMapping("/produits/{id}")
    ProductDTO getProduitById(@PathVariable("id") Long id);
}
```

**Magie de Feign**:
- Feign génère automatiquement l'implémentation
- Il utilise Eureka pour trouver le service `MICROSERVICE-PRODUIT`
- Il gère le load balancing si plusieurs instances existent
- Il sérialise/désérialise automatiquement le JSON

**Question d'entretien**:
*"Comment Feign sait-il quelle instance appeler ?"*

**Réponse**:
1. Feign demande à Eureka: "Donne-moi toutes les instances de MICROSERVICE-PRODUIT"
2. Eureka répond: `["http://192.168.1.10:8082", "http://192.168.1.11:8082"]`
3. Spring Cloud LoadBalancer choisit une instance (Round Robin)
4. Feign fait l'appel HTTP vers cette instance

#### b) Circuit Breaker avec Resilience4j

```java
@GetMapping("/{id}")
@CircuitBreaker(name = "produitService", fallbackMethod = "fallbackGetCommande")
public CommandeResponseDTO getCommandeWithProduct(@PathVariable("id") Long id) {
    Commande commande = repository.findById(id).orElseThrow();
    ProductDTO product = productClient.getProduitById(commande.getIdProduit());
    return new CommandeResponseDTO(commande, product);
}

public CommandeResponseDTO fallbackGetCommande(Long id, Throwable t) {
    Commande commande = repository.findById(id).orElseThrow();
    ProductDTO fallbackProduct = new ProductDTO();
    fallbackProduct.setNom("Produit non disponible (Fallback)");
    fallbackProduct.setPrix(0.0);
    return new CommandeResponseDTO(commande, fallbackProduct);
}
```

**Configuration du Circuit Breaker**:
```yaml
resilience4j:
  circuitbreaker:
    instances:
      produitService:
        slidingWindowSize: 5              # Fenêtre de 5 appels
        failureRateThreshold: 50          # 50% d'échecs = ouverture
        waitDurationInOpenState: 5s       # Attendre 5s avant de réessayer
        permittedNumberOfCallsInHalfOpenState: 3  # 3 appels de test
```

**États du Circuit Breaker**:

```
CLOSED (Normal)
    │
    │ 50% d'échecs sur 5 appels
    ▼
OPEN (Fallback systématique)
    │
    │ Après 5 secondes
    ▼
HALF_OPEN (Test de récupération)
    │
    ├─► 3 appels réussis → CLOSED
    └─► 1 échec → OPEN
```

**Question d'entretien**:
*"Pourquoi utiliser un Circuit Breaker ?"*

**Réponse**:
- **Éviter l'effet domino**: Si le service Produit est down, ne pas surcharger avec des appels inutiles
- **Fail Fast**: Répondre immédiatement avec le fallback au lieu d'attendre un timeout
- **Auto-récupération**: Tester automatiquement si le service est revenu
- **Expérience utilisateur**: Afficher des données partielles plutôt qu'une erreur totale

**Exemple concret**:
1. Service Produit tombe en panne
2. 3 appels échouent (50% sur fenêtre de 5)
3. Circuit Breaker s'ouvre → Fallback immédiat
4. Après 5 secondes, 3 appels de test
5. Si succès → Circuit se ferme, sinon reste ouvert 5s de plus

---

## 🔄 Flux de Données Complet

### Scénario: Récupérer une commande avec son produit

```
1. Client → Gateway
   GET http://localhost:8080/api/v2/commandes/1

2. Gateway → Eureka
   "Où est MICROSERVICE-COMMANDES-V2 ?"
   
3. Eureka → Gateway
   "Il est sur http://192.168.1.10:8083"

4. Gateway → Commandes V2
   GET http://192.168.1.10:8083/commandes-v2/1

5. Commandes V2 → Base H2
   SELECT * FROM commande WHERE id = 1
   Résultat: {id: 1, description: "Achat Laptop", idProduit: 1}

6. Commandes V2 → Eureka (via Feign)
   "Où est MICROSERVICE-PRODUIT ?"

7. Eureka → Commandes V2
   "Il est sur http://192.168.1.11:8082"

8. Commandes V2 → Produit (via Feign)
   GET http://192.168.1.11:8082/produits/1

9. Produit → Base H2
   SELECT * FROM produit WHERE id = 1
   Résultat: {id: 1, nom: "Laptop Dell", prix: 1200.0}

10. Produit → Commandes V2
    Retourne le JSON du produit

11. Commandes V2 → Gateway
    Combine commande + produit dans CommandeResponseDTO

12. Gateway → Client
    {
      "id": 1,
      "description": "Achat Laptop",
      "produit": {
        "id": 1,
        "nom": "Laptop Dell",
        "prix": 1200.0
      }
    }
```

**Temps total**: ~200-300ms (dont ~50ms pour chaque appel réseau)

---

## 🛡️ Patterns et Bonnes Pratiques

### 1. API Gateway Pattern
**Problème**: Clients doivent connaître l'adresse de chaque microservice
**Solution**: Un seul point d'entrée qui route vers les services

### 2. Service Registry Pattern
**Problème**: Comment les services se trouvent-ils ?
**Solution**: Eureka comme annuaire centralisé

### 3. Circuit Breaker Pattern
**Problème**: Un service down peut faire tomber tout le système
**Solution**: Resilience4j pour isoler les pannes

### 4. Externalized Configuration
**Problème**: Configurations différentes par environnement
**Solution**: Config Server avec Git comme source

### 5. Health Check Pattern
**Problème**: Comment savoir si un service fonctionne vraiment ?
**Solution**: Health Indicators personnalisés

### 6. Client-Side Load Balancing
**Problème**: Distribuer la charge entre instances
**Solution**: Spring Cloud LoadBalancer avec Eureka

---

## 🚀 Démarrage et Ordre d'Exécution

### Ordre critique:
```
1. Config Server (8888)    ← Source de vérité pour les configs
   ↓ Attendre 20s
2. Eureka Server (8761)    ← Annuaire des services
   ↓ Attendre 20s
3. Microservices (8081-8083) ← S'enregistrent dans Eureka
   ↓ Attendre 15s chacun
4. Gateway (8080)          ← Utilise Eureka pour router
```

**Pourquoi cet ordre ?**
- Config Server d'abord car les autres en dépendent
- Eureka ensuite car les microservices doivent s'y enregistrer
- Gateway en dernier car il a besoin que les services soient dans Eureka

---

## 🧪 Tests et Validation

### 1. Test CRUD (V1)
```bash
# Créer
curl -X POST http://localhost:8080/api/v1/commandes \
  -H "Content-Type: application/json" \
  -d '{"description":"Test","quantite":1,"date":"2025-01-01","montant":100}'

# Lire
curl http://localhost:8080/api/v1/commandes/1

# Mettre à jour
curl -X PUT http://localhost:8080/api/v1/commandes/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Modifié","quantite":2,"date":"2025-01-01","montant":200}'

# Supprimer
curl -X DELETE http://localhost:8080/api/v1/commandes/1
```

### 2. Test Config Refresh
```bash
# 1. Voir la config actuelle
curl http://localhost:8080/api/v1/commandes/recent
# Retourne commandes des 10 derniers jours

# 2. Modifier dans Git: commandes-last: 20

# 3. Rafraîchir
curl -X POST http://localhost:8081/actuator/refresh

# 4. Vérifier
curl http://localhost:8080/api/v1/commandes/recent
# Retourne maintenant commandes des 20 derniers jours
```

### 3. Test Circuit Breaker
```bash
# 1. Appel normal
curl http://localhost:8080/api/v2/commandes/1
# Retourne: {"produit": {"nom": "Laptop Dell", "prix": 1200.0}}

# 2. Arrêter le service Produit
taskkill /F /FI "WINDOWTITLE eq Produit Service*"

# 3. Appel avec service down
curl http://localhost:8080/api/v2/commandes/1
# Retourne: {"produit": {"nom": "Produit non disponible (Fallback)", "prix": 0.0}}

# 4. Redémarrer le service Produit

# 5. Après quelques appels, le circuit se referme
curl http://localhost:8080/api/v2/commandes/1
# Retourne à nouveau: {"produit": {"nom": "Laptop Dell", "prix": 1200.0}}
```

### 4. Test Load Balancing
```bash
# Démarrer 2ème instance de Commandes V1
cd microservice-commandes-v1
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8084"

# Appeler 10 fois
for i in {1..10}; do
  curl http://localhost:8080/api/v1/commandes/info
done

# Résultat: Alternance entre port 8081 et 8084
```

---

## 🎯 Questions d'Entretien Fréquentes

### Q1: "Pourquoi utiliser des microservices plutôt qu'un monolithe ?"

**Réponse**:
**Avantages**:
- ✅ **Scalabilité indépendante**: Scaler uniquement le service Produit si besoin
- ✅ **Déploiement indépendant**: Mettre à jour V2 sans toucher à V1
- ✅ **Technologie hétérogène**: Chaque service peut utiliser une stack différente
- ✅ **Isolation des pannes**: Si Produit tombe, Commandes continue de fonctionner
- ✅ **Équipes autonomes**: Une équipe par service

**Inconvénients**:
- ❌ **Complexité**: Plus de composants à gérer
- ❌ **Latence réseau**: Appels inter-services plus lents qu'appels locaux
- ❌ **Transactions distribuées**: Difficile de garantir la cohérence
- ❌ **Debugging**: Tracer une requête à travers plusieurs services

**Quand utiliser des microservices**:
- Équipe > 10 personnes
- Application complexe avec domaines métier distincts
- Besoin de scalabilité différenciée
- Déploiements fréquents

### Q2: "Comment gérez-vous les transactions distribuées ?"

**Réponse**:
Dans ce projet, on évite les transactions distribuées en utilisant:
- **Eventual Consistency**: Accepter que les données soient temporairement incohérentes
- **Saga Pattern**: Séquence de transactions locales avec compensation en cas d'échec
- **Event Sourcing**: Stocker les événements plutôt que l'état

**Exemple de Saga**:
```
1. Créer commande (Commandes V2)
2. Réserver produit (Produit)
3. Si échec → Annuler commande (compensation)
```

### Q3: "Comment sécurisez-vous les microservices ?"

**Réponse** (non implémenté dans ce projet, mais à connaître):
- **OAuth2 + JWT**: Authentification via token
- **Spring Security**: Protection des endpoints
- **API Gateway**: Vérification du token avant routing
- **HTTPS**: Chiffrement des communications
- **Service Mesh (Istio)**: Sécurité au niveau réseau

### Q4: "Comment gérez-vous les logs dans une architecture distribuée ?"

**Réponse** (à implémenter):
- **Correlation ID**: ID unique par requête propagé à tous les services
- **Centralized Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Distributed Tracing**: Zipkin ou Jaeger pour tracer les requêtes

**Exemple**:
```
Gateway: [correlation-id: abc123] Routing to Commandes V2
Commandes V2: [correlation-id: abc123] Fetching commande 1
Commandes V2: [correlation-id: abc123] Calling Produit service
Produit: [correlation-id: abc123] Fetching produit 1
```

### Q5: "Que se passe-t-il si Eureka tombe ?"

**Réponse**:
- Les services **déjà enregistrés** continuent de fonctionner
- Eureka a un **cache client** qui persiste 30 secondes
- Les nouveaux services ne peuvent pas s'enregistrer
- **Solution**: Cluster Eureka (plusieurs instances)

### Q6: "Comment testez-vous les microservices ?"

**Réponse**:
- **Unit Tests**: Tester la logique métier isolément
- **Integration Tests**: Tester avec une vraie base H2
- **Contract Tests**: Vérifier que le contrat API est respecté (Pact)
- **End-to-End Tests**: Tester le flux complet via Gateway

---

## 📊 Métriques et Monitoring

### Endpoints Actuator
```bash
# Health Check
curl http://localhost:8081/actuator/health

# Métriques
curl http://localhost:8081/actuator/metrics

# Info sur l'application
curl http://localhost:8081/actuator/info

# État du Circuit Breaker
curl http://localhost:8083/actuator/circuitbreakers
```

### Métriques importantes à surveiller:
- **Latence**: Temps de réponse moyen
- **Throughput**: Nombre de requêtes/seconde
- **Error Rate**: Pourcentage d'erreurs
- **Circuit Breaker State**: Ouvert/Fermé
- **Eureka Instances**: Nombre de services enregistrés

---

## 🔧 Problèmes Courants et Solutions

### Problème 1: Service ne s'enregistre pas dans Eureka
**Symptômes**: Service démarre mais n'apparaît pas dans Eureka Dashboard

**Solutions**:
1. Vérifier que Eureka est démarré
2. Vérifier la config `eureka.client.service-url.defaultZone`
3. Attendre 30 secondes (délai d'enregistrement)
4. Vérifier les logs: `Cannot execute request on any known server`

### Problème 2: Gateway retourne 503 Service Unavailable
**Symptômes**: `{"status":503,"error":"Service Unavailable"}`

**Solutions**:
1. Vérifier que le service cible est dans Eureka
2. Vérifier le nom du service dans la route (`lb://MICROSERVICE-XXX`)
3. Attendre que le service soit "UP" dans Eureka

### Problème 3: Circuit Breaker toujours ouvert
**Symptômes**: Fallback systématique même quand le service fonctionne

**Solutions**:
1. Vérifier `failureRateThreshold` (peut-être trop bas)
2. Vérifier `waitDurationInOpenState` (temps avant réessai)
3. Forcer la fermeture via Actuator: `POST /actuator/circuitbreakers/produitService/reset`

### Problème 4: Config Server ne trouve pas les fichiers
**Symptômes**: `Could not locate PropertySource`

**Solutions**:
1. Vérifier l'URI Git dans `application.yml`
2. Vérifier le nom du fichier: `{application-name}.yml`
3. Vérifier la branche: `default-label: main`

---

## 🎓 Concepts Avancés

### 1. Bulkhead Pattern
**Principe**: Isoler les ressources pour éviter qu'un service lent bloque tout

```yaml
resilience4j:
  bulkhead:
    instances:
      produitService:
        maxConcurrentCalls: 10  # Max 10 appels simultanés
```

### 2. Rate Limiting
**Principe**: Limiter le nombre de requêtes par client

```yaml
resilience4j:
  ratelimiter:
    instances:
      produitService:
        limitForPeriod: 100      # 100 requêtes
        limitRefreshPeriod: 1s   # par seconde
```

### 3. Retry Pattern
**Principe**: Réessayer automatiquement en cas d'échec temporaire

```yaml
resilience4j:
  retry:
    instances:
      produitService:
        maxAttempts: 3
        waitDuration: 1s
```

### 4. Cache Pattern
**Principe**: Mettre en cache les réponses pour réduire les appels

```java
@Cacheable(value = "produits", key = "#id")
public Produit getProduitById(Long id) {
    return repository.findById(id).orElseThrow();
}
```

---

## 📝 Checklist de Préparation Entretien

### Connaissances Théoriques
- [ ] Expliquer l'architecture microservices vs monolithe
- [ ] Décrire le rôle de chaque composant (Eureka, Config, Gateway)
- [ ] Expliquer le Circuit Breaker et ses états
- [ ] Décrire le Service Discovery
- [ ] Expliquer le Load Balancing client-side

### Connaissances Pratiques
- [ ] Démarrer tous les services dans le bon ordre
- [ ] Tester un endpoint via Gateway
- [ ] Modifier une config et la rafraîchir
- [ ] Simuler une panne et observer le fallback
- [ ] Lire les logs et identifier un problème

### Questions à Poser à l'Interviewer
- "Quelle est votre stratégie de déploiement des microservices ?"
- "Utilisez-vous Kubernetes ou Docker Swarm ?"
- "Comment gérez-vous les secrets (DB passwords, API keys) ?"

---

## 📍 Correspondance avec l'Énoncé du Projet

Cette section fait le lien direct entre les exigences de l'énoncé et leur implémentation dans le code.

### 1. Load Balancing (Point 'e')
> **Énoncé**: *"Mettre en place le mécanisme de load balancing pour cette application."*

*   **Où ?** Dans `gateway-server`, fichier `application.yml`.
*   **Code**: `uri: lb://MICROSERVICE-COMMANDES-V2`
*   **Explication**: Le préfixe `lb://` (Load Balancer) indique à Spring Cloud Gateway d'utiliser Eureka pour obtenir la liste des instances disponibles du service. Si vous lancez 2 instances de `microservice-commandes-v2` (ex: port 8083 et 8084), la Gateway alternera les requêtes entre elles (Round Robin).

### 2. Timeout & Hystrix/Resilience4j (Point 'f')
> **Énoncé**: *"Simuler un Timeout d’un des deux microservices, et implémenter un mécanisme de contournement pour protéger le microservice appelant avec Hystrix."*

*   **Où ?** Dans `microservice-commandes-v2`, classe `CommandeController.java`.
*   **Code**:
    ```java
    @CircuitBreaker(name = "produitService", fallbackMethod = "fallbackGetCommande")
    public CommandeResponseDTO getCommandeWithProduct(...) { ... }
    ```
*   **Simulation**: Éteignez le `microservice-produit`.
*   **Résultat**: Au lieu d'une erreur 500, la méthode `fallbackGetCommande` est appelée et retourne un produit "bouchon" (ex: "Produit non disponible (Fallback)"), permettant à l'application de continuer à fonctionner en mode dégradé.
*   *Note: Hystrix étant déprécié depuis Spring Boot 2.4, nous utilisons son successeur standard : **Resilience4j**.*

### 3. API Gateway (Point 'c')
> **Énoncé**: *"Implémenter une Gateway (Zuul ou API Gateway) comme point d’accès unique à l’application."*

*   **Où ?** Projet `gateway-server` (Port 8080).
*   **Technologie**: Spring Cloud Gateway (successeur de Zuul).
*   **Fonction**: C'est le SEUL port que le client (Frontend React) contacte. La Gateway redirige ensuite vers 8081, 8082, 8083.
*   **Preuve**: Dans le code React (`api.js`), `baseURL` pointe sur `http://localhost:8080`.

### 4. Où est "Spring Cloud" dans ce projet ?
C'est la question piège classique. Voici le résumé :
- **Spring Cloud Config** : Module `config-server`, gestion centralisée des `.yml`.
- **Spring Cloud Netflix Eureka** : Module `eureka-server`, annuaire des services.
- **Spring Cloud Gateway** : Module `gateway-server`, point d'entrée unique.
- **Spring Cloud OpenFeign** : Dans Commandes V2, interface `ProductClient` pour appeler le service Produit.
- **Spring Cloud LoadBalancer** : Intégré via le préfixe `lb://` dans la Gateway et Feign.
- **Spring Cloud Circuit Breaker** : Intégration de Resilience4j pour le fallback.
- "Quelle est votre stratégie de versioning des APIs ?"
- "Comment tracez-vous les requêtes à travers les services ?"

---

## 🚀 Améliorations Possibles

### Court Terme
1. **Ajouter des tests unitaires** avec JUnit et Mockito
2. **Implémenter la pagination** pour les listes
3. **Ajouter la validation** avec `@Valid` et Bean Validation
4. **Dockeriser** les services avec Docker Compose

### Moyen Terme
1. **Ajouter Spring Security** avec OAuth2
2. **Implémenter le Saga Pattern** pour les transactions
3. **Ajouter Zipkin** pour le distributed tracing
4. **Utiliser une vraie base de données** (PostgreSQL)

### Long Terme
1. **Déployer sur Kubernetes** avec Helm Charts
2. **Implémenter un Service Mesh** (Istio)
3. **Ajouter GraphQL** comme alternative à REST
4. **Implémenter Event-Driven Architecture** avec Kafka

---

## 🎯 Conclusion

Ce projet démontre une **architecture microservices complète et fonctionnelle** avec:
- ✅ Service Discovery (Eureka)
- ✅ API Gateway (Spring Cloud Gateway)
- ✅ Configuration centralisée (Config Server)
- ✅ Résilience (Circuit Breaker)
- ✅ Communication inter-services (OpenFeign)
- ✅ Load Balancing
- ✅ Health Checks personnalisés

**Points forts à mettre en avant**:
- Architecture découplée et scalable
- Patterns modernes (Circuit Breaker, Service Registry)
- Configuration externalisée
- Résilience face aux pannes

**Points d'amélioration à mentionner**:
- Sécurité (OAuth2, JWT)
- Observabilité (Logs centralisés, Tracing)
- Tests automatisés
- CI/CD Pipeline

**Message final pour l'entretien**:
"Ce projet m'a permis de comprendre les défis des architectures distribuées et l'importance des patterns comme le Circuit Breaker pour la résilience. J'ai appris que la simplicité est clé - par exemple, notre problème avec ResponseEntity m'a enseigné à toujours privilégier la solution la plus simple qui fonctionne."
