#!/usr/bin/env python3
"""
Script de emergencia para limpiar credenciales expuestas
"""

import os
import re

def clean_sensitive_files():
    """Limpiar archivos que contienen credenciales sensibles"""
    
    # Lista de archivos que contienen credenciales reales
    sensitive_files = [
        "backend/env.production",
        "scripts/run_backend_aiven.cmd", 
        "scripts/start_local_aiven.bat",
        "scripts/test_local.env",
        "docs/CAMBIOS_VERSION_0.0.2.md",
        "docs/DEPLOYMENT_GUIDE.md",
        "docs/DOCUMENTACION_COMPLETA_ASTREN.md"
    ]
    
    # Patrón para encontrar la contraseña real
    password_pattern = r'AVNS_v9XMXN-BE9Or-VI580I'
    replacement = 'YOUR_AIVEN_PASSWORD_HERE'
    
    print("🚨 LIMPIEZA DE CREDENCIALES SENSIBLES")
    print("=" * 50)
    
    for file_path in sensitive_files:
        if os.path.exists(file_path):
            print(f"🔍 Procesando: {file_path}")
            
            try:
                # Leer archivo
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Reemplazar contraseña real
                if password_pattern in content:
                    new_content = re.sub(password_pattern, replacement, content)
                    
                    # Escribir archivo limpio
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    print(f"✅ Limpiado: {file_path}")
                else:
                    print(f"ℹ️  No contiene credenciales: {file_path}")
                    
            except Exception as e:
                print(f"❌ Error procesando {file_path}: {e}")
        else:
            print(f"⚠️  Archivo no encontrado: {file_path}")
    
    print("\n" + "=" * 50)
    print("✅ LIMPIEZA COMPLETADA")
    print("⚠️  IMPORTANTE: Revisa cada archivo manualmente")
    print("⚠️  IMPORTANTE: Cambia la contraseña en Aiven")

def create_secure_env_template():
    """Crear plantilla segura para archivos de entorno"""
    
    template_content = """# Configuración de Base de Datos para Aiven
# ⚠️  IMPORTANTE: Reemplaza los valores con tus credenciales reales
# ⚠️  IMPORTANTE: NUNCA subas este archivo con credenciales reales

MYSQL_HOST=your-aiven-host.aivencloud.com
MYSQL_USER=your-aiven-user
MYSQL_PASSWORD=YOUR_AIVEN_PASSWORD_HERE
MYSQL_DATABASE=your-database-name
MYSQL_PORT=your-port

# Configuración de Flask
FLASK_ENV=production
FLASK_DEBUG=False
PORT=8000

# Configuración SSL para Aiven
MYSQL_SSL_MODE=REQUIRED
MYSQL_SSL_CA=/path/to/ca.pem
"""
    
    # Crear plantilla para producción
    with open("backend/env.production.template", "w", encoding="utf-8") as f:
        f.write(template_content)
    
    print("📄 Creado: backend/env.production.template")
    print("💡 Usa este archivo como plantilla para tu configuración real")

def main():
    print("🚨 SCRIPT DE EMERGENCIA - LIMPIEZA DE CREDENCIALES")
    print("=" * 60)
    print("⚠️  ADVERTENCIA: Este script limpiará credenciales sensibles")
    print("⚠️  ADVERTENCIA: Asegúrate de tener respaldo de tus credenciales")
    print("=" * 60)
    
    response = input("¿Continuar con la limpieza? (sí/no): ").lower()
    
    if response in ['sí', 'si', 'yes', 'y']:
        clean_sensitive_files()
        create_secure_env_template()
        
        print("\n" + "=" * 60)
        print("🎯 ACCIONES INMEDIATAS REQUERIDAS:")
        print("=" * 60)
        print("1. 🔑 CAMBIA LA CONTRASEÑA EN AIVEN INMEDIATAMENTE")
        print("2. 📝 Actualiza todos los archivos con la nueva contraseña")
        print("3. 🔒 Asegúrate de que .gitignore incluya archivos sensibles")
        print("4. 🗑️  Elimina el historial de Git si es necesario")
        print("5. 🔄 Haz commit de los cambios limpios")
        print("=" * 60)
    else:
        print("❌ Operación cancelada")

if __name__ == "__main__":
    main()
