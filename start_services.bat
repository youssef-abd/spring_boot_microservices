@echo off
echo Lancement de l'architecture Microservices...

echo 1. Lancement du Config Server...
start "Config Server" /D "config-server" mvn spring-boot:run
timeout /t 15

echo 2. Lancement de Eureka Server...
start "Eureka Server" /D "eureka-server" mvn spring-boot:run
timeout /t 15

echo 3. Lancement des Microservices...
start "Produit Service" /D "microservice-produit" mvn spring-boot:run
start "Commandes V1" /D "microservice-commandes-v1" mvn spring-boot:run
start "Commandes V2" /D "microservice-commandes-v2" mvn spring-boot:run
timeout /t 20

echo 4. Lancement de la Gateway...
start "Gateway Server" /D "gateway-server" mvn spring-boot:run

echo.
echo Tout est en cours de demarrage !
echo Une fois pret, accedez a :
echo - Eureka : http://localhost:8761
echo - Swagger V1 : http://localhost:8081/swagger-ui/index.html
echo - Swagger V2 : http://localhost:8083/swagger-ui/index.html
echo - Swagger Produit : http://localhost:8082/swagger-ui/index.html
pause
