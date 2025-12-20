@echo off
echo ========================================================
echo DEMARRAGE MICROSERVICES - VERSION PROPRE
echo ========================================================

echo.
echo 1. Config Server (port 8888)...
start "Config Server" cmd /c "cd config-server && mvn spring-boot:run"
timeout /t 1 /nobreak > nul

echo.
echo 2. Eureka Server (port 8761)...
start "Eureka Server" cmd /c "cd eureka-server && mvn spring-boot:run"
timeout /t 1 /nobreak > nul

echo.
echo 3. Microservice Produit (port 8082)...
start "Produit Service" cmd /c "cd microservice-produit && mvn spring-boot:run"
timeout /t 1 /nobreak > nul

echo.
echo 4. Microservice Commandes V1 (port 8081)...
start "Commandes V1" cmd /c "cd microservice-commandes-v1 && mvn spring-boot:run"
timeout /t 1 /nobreak > nul

echo.
echo 5. Microservice Commandes V2 (port 8083)...
start "Commandes V2" cmd /c "cd microservice-commandes-v2 && mvn spring-boot:run"
timeout /t 1 /nobreak > nul

echo.
echo 6. Gateway Server (port 8080)...
start "Gateway Server" cmd /c "cd gateway-server && mvn spring-boot:run"

echo.
echo ========================================================
echo TOUS LES SERVICES SONT EN COURS DE DEMARRAGE
echo ========================================================
echo.
echo Patientez 1-2 minutes puis testez:
echo - Eureka: http://localhost:8761
echo - Swagger Produit: http://localhost:8082/swagger-ui/index.html
echo - Swagger V2: http://localhost:8083/swagger-ui/index.html
echo.
pause
