@echo off
echo ========================================================
echo TEST DU PROJET MICROSERVICES (via Gateway :8080)
echo ========================================================

echo.
echo 1. Liste des commandes V1 :
curl -s http://localhost:8080/api/v1/commandes
echo.

echo.
echo 2. Liste des produits :
curl -s http://localhost:8080/api/produits
echo.

echo.
echo 3. Detail Commande V2 (avec appel Produit) :
curl -s http://localhost:8080/api/v2/commandes/1
echo.

echo.
echo 4. Load Balancing Info (appuyez sur une touche pour lancer 5 appels) :
pause
for /l %%x in (1, 1, 5) do (
   curl -s http://localhost:8080/api/v1/commandes/info
   echo.
)

echo.
echo 5. Commandes Recentes (Config param) :
curl -s http://localhost:8080/api/v1/commandes/recent
echo.

echo.
echo 6. Health Check V1 :
curl -s http://localhost:8081/actuator/health
echo.

echo.
echo ========================================================
echo FIN DES TESTS
echo ========================================================
pause
