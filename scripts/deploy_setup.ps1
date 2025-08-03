# Script para preparar Astren para despliegue
Write-Host "Preparando Astren para despliegue..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend/app.py")) {
    Write-Host "Error: No se encontro backend/app.py" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde la carpeta raiz de Astren" -ForegroundColor Yellow
    exit 1
}

Write-Host "Verificando estructura del proyecto..." -ForegroundColor Green

# Verificar archivos necesarios
$requiredFiles = @(
    "backend/app.py",
    "backend/requirements.txt",
    "backend/Procfile",
    "backend/runtime.txt",
    "frontend/js/config.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $file - NO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Pasos para desplegar:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Sube tu codigo a GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Preparado para despliegue'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Despliega en Render.com:" -ForegroundColor White
Write-Host "   - Ve a render.com" -ForegroundColor Gray
Write-Host "   - Conecta tu GitHub" -ForegroundColor Gray
Write-Host "   - New Web Service" -ForegroundColor Gray
Write-Host "   - Selecciona tu repositorio" -ForegroundColor Gray
Write-Host "   - Build Command: pip install -r backend/requirements.txt" -ForegroundColor Gray
Write-Host "   - Start Command: python backend/app.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configura base de datos MySQL:" -ForegroundColor White
Write-Host "   - En Render Dashboard -> New Database" -ForegroundColor Gray
Write-Host "   - Selecciona MySQL" -ForegroundColor Gray
Write-Host "   - Copia las credenciales" -ForegroundColor Gray
Write-Host "   - Configura variables de entorno en tu servicio web" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Despliega frontend en Vercel:" -ForegroundColor White
Write-Host "   - Ve a vercel.com" -ForegroundColor Gray
Write-Host "   - Conecta tu GitHub" -ForegroundColor Gray
Write-Host "   - Importa tu repositorio" -ForegroundColor Gray
Write-Host "   - Framework Preset: Other" -ForegroundColor Gray
Write-Host "   - Build Command: cp -r frontend/* ." -ForegroundColor Gray
Write-Host "   - Output Directory: ." -ForegroundColor Gray
Write-Host ""
Write-Host "5. Actualiza config.js:" -ForegroundColor White
Write-Host "   - Cambia la URL del backend en frontend/js/config.js" -ForegroundColor Gray
Write-Host "   - Sube los cambios a GitHub" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Prueba la aplicacion:" -ForegroundColor White
Write-Host "   - Verifica que el login funcione" -ForegroundColor Gray
Write-Host "   - Prueba crear tareas y grupos" -ForegroundColor Gray
Write-Host "   - Verifica que las estadisticas se muestren" -ForegroundColor Gray
Write-Host ""
Write-Host "URLs finales:" -ForegroundColor Cyan
Write-Host "   - Backend: https://tu-app.onrender.com" -ForegroundColor White
Write-Host "   - Frontend: https://tu-app.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "   - Email: abraham@example.com" -ForegroundColor White
Write-Host "   - Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Listo para desplegar!" -ForegroundColor Green 