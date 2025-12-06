# Guide de Publication sur GitHub

## Étape 1 : Créer le Repository sur GitHub

1. Allez sur https://github.com
2. Cliquez sur "New repository"
3. Nom : `jee-microservices-project`
4. Description : "Architecture microservices avec Spring Boot 3 et Spring Cloud - Projet JEE"
5. **Public** (pour le portfolio) ou **Private** (si vous préférez)
6. ❌ **NE PAS** cocher "Initialize with README" (on a déjà un README)
7. Cliquez sur "Create repository"

## Étape 2 : Préparer le Projet Localement

### 2.1 Vérifier le .gitignore

Assurez-vous que le fichier `.gitignore` existe et contient :

```gitignore
# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# IDE
.idea/
*.iml
*.iws
*.ipr
.vscode/
.settings/
.project
.classpath

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Spring Boot
spring-boot-*.jar
*.jar
!.mvn/wrapper/maven-wrapper.jar

# H2 Database
*.db
*.trace.db

# Temporary files
*.tmp
*.bak
*.swp
*~
```

### 2.2 Initialiser Git (si pas déjà fait)

```bash
cd C:\JEE_micro
git init
```

### 2.3 Ajouter tous les fichiers

```bash
git add .
```

### 2.4 Créer le premier commit

```bash
git commit -m "Initial commit: Spring Cloud Microservices Architecture

- Config Server with Git backend
- Eureka Server for service discovery
- Spring Cloud Gateway as API Gateway
- Microservice Commandes V1 with custom health checks
- Microservice Commandes V2 with Circuit Breaker (Resilience4j)
- Microservice Produit with sample data
- OpenFeign for inter-service communication
- Load balancing with Spring Cloud LoadBalancer
- Centralized configuration with @RefreshScope
- OpenAPI/Swagger documentation
- Complete README with architecture diagram
- Technical interview preparation guide"
```

## Étape 3 : Lier au Repository GitHub

```bash
# Remplacez 'votre-username' par votre nom d'utilisateur GitHub
git remote add origin https://github.com/votre-username/jee-microservices-project.git

# Vérifier que le remote est bien configuré
git remote -v
```

## Étape 4 : Pousser sur GitHub

```bash
# Renommer la branche en 'main' si nécessaire
git branch -M main

# Pousser le code
git push -u origin main
```

## Étape 5 : Vérifier sur GitHub

1. Allez sur `https://github.com/votre-username/jee-microservices-project`
2. Vérifiez que tous les fichiers sont présents
3. Vérifiez que le README.md s'affiche correctement
4. Vérifiez que le diagramme Mermaid s'affiche

## Étape 6 : Améliorer le Repository (Optionnel)

### 6.1 Ajouter des Topics (Tags)

Sur GitHub, cliquez sur ⚙️ à côté de "About" et ajoutez :
- `spring-boot`
- `spring-cloud`
- `microservices`
- `eureka`
- `circuit-breaker`
- `api-gateway`
- `resilience4j`
- `openfeign`
- `java-17`

### 6.2 Ajouter un Badge au README

Ajoutez en haut du README.md :

```markdown
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-green)
![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
```

### 6.3 Créer une GitHub Action pour Build (Optionnel)

Créez `.github/workflows/maven.yml` :

```yaml
name: Java CI with Maven

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Build with Maven
      run: mvn clean install -DskipTests
```

## Étape 7 : Mettre à Jour le Config Server

⚠️ **IMPORTANT** : Votre Config Server pointe vers le repo de config.

Si vous voulez que le config-repo soit dans le même projet :

### Option A : Garder le repo séparé (RECOMMANDÉ)
- ✅ Config Server continue de pointer vers `https://github.com/youssef-abd/jee-config-repo.git`
- ✅ Pas de changement nécessaire
- ✅ Séparation des préoccupations (code vs config)

### Option B : Utiliser un sous-dossier du nouveau repo
1. Créer un dossier `config-files` dans le nouveau repo
2. Modifier `config-server/src/main/resources/application.yml` :

```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/votre-username/jee-microservices-project.git
          search-paths: config-files
          default-label: main
```

3. Copier les fichiers de config dans `config-files/`

## Commandes Complètes (Copier-Coller)

```bash
# 1. Aller dans le dossier du projet
cd C:\JEE_micro

# 2. Initialiser Git (si pas déjà fait)
git init

# 3. Ajouter tous les fichiers
git add .

# 4. Premier commit
git commit -m "Initial commit: Spring Cloud Microservices Architecture"

# 5. Lier au repository GitHub (REMPLACEZ votre-username)
git remote add origin https://github.com/votre-username/jee-microservices-project.git

# 6. Pousser sur GitHub
git branch -M main
git push -u origin main
```

## En Cas d'Erreur

### Erreur : "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/votre-username/jee-microservices-project.git
```

### Erreur : "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Erreur : Authentification
Si GitHub demande un mot de passe :
1. Allez sur GitHub Settings > Developer settings > Personal access tokens
2. Générez un nouveau token (classic)
3. Cochez "repo"
4. Utilisez le token comme mot de passe

## Résultat Final

Vous aurez :
- ✅ **Repository 1** : `jee-config-repo` (fichiers de configuration uniquement)
- ✅ **Repository 2** : `jee-microservices-project` (tout le code source)

Les deux sont liés car le Config Server lit depuis le premier repo.

## Pour Votre CV / Portfolio

Mentionnez :
```
🔗 GitHub: https://github.com/votre-username/jee-microservices-project
📝 Architecture microservices complète avec Spring Boot 3 et Spring Cloud
🛠️ Technologies: Eureka, Gateway, Config Server, Resilience4j, OpenFeign
```
