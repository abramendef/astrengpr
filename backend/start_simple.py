#!/usr/bin/env python3
"""
Inicio simple del servidor Astren
"""
import os
import sys
from dotenv import load_dotenv

# Cargar configuración
if os.path.exists('env.local'):
    load_dotenv('env.local')
    print("✅ Configuración cargada desde env.local")
elif os.path.exists('env.production'):
    load_dotenv('env.production')
    print("✅ Configuración cargada desde env.production")
else:
    load_dotenv()
    print("✅ Configuración cargada desde .env")

# Mostrar configuración
port = int(os.getenv('PORT', 5000))
print(f"🔧 Puerto: {port}")
print(f"🔧 Host: 0.0.0.0")
print(f"🔧 Debug: True")

try:
    print("📦 Importando aplicación...")
    from app import app
    print("✅ Aplicación importada correctamente")
    
    print(f"🚀 Iniciando servidor en http://localhost:{port}")
    print("🛑 Presiona Ctrl+C para detener")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True,
        use_reloader=False,
        threaded=True
    )
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

