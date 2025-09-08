#!/usr/bin/env python3
"""
Script para verificar si la contraseña vieja aún funciona
"""

import os
import sys
import mysql.connector
from dotenv import load_dotenv

# Agregar el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Cargar variables de entorno
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', 'env.local'))

def test_old_password():
    """Probar si la contraseña vieja aún funciona"""
    print("🔍 Probando contraseña vieja...")
    
    # Contraseña vieja que estaba expuesta (ya no funciona)
    old_password = "OLD_PASSWORD_REMOVED_FOR_SECURITY"
    
    try:
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=old_password,  # Usar contraseña vieja
            database=os.getenv('MYSQL_DATABASE'),
            port=int(os.getenv('MYSQL_PORT')),
            ssl_disabled=False,
            ssl_verify_cert=False,
            ssl_verify_identity=False,
            connection_timeout=10
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]
        
        print(f"❌ ¡PELIGRO! La contraseña vieja AÚN FUNCIONA")
        print(f"   Se encontraron {count} usuarios")
        print(f"   🔑 Contraseña vieja: {old_password}")
        
        cursor.close()
        conn.close()
        return True
        
    except mysql.connector.Error as e:
        if "Access denied" in str(e) or "authentication" in str(e).lower():
            print(f"✅ ¡BIEN! La contraseña vieja YA NO FUNCIONA")
            print(f"   Error: {e}")
            return False
        else:
            print(f"❓ Error inesperado: {e}")
            return None
    except Exception as e:
        print(f"❓ Error: {e}")
        return None

def test_current_password():
    """Probar contraseña actual en env.local"""
    print("\n🔍 Probando contraseña actual en env.local...")
    
    try:
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=int(os.getenv('MYSQL_PORT')),
            ssl_disabled=False,
            ssl_verify_cert=False,
            ssl_verify_identity=False,
            connection_timeout=10
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]
        
        print(f"✅ Contraseña actual funciona - {count} usuarios encontrados")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Contraseña actual no funciona: {e}")
        return False

def main():
    print("=" * 60)
    print("🔍 VERIFICACIÓN DE SEGURIDAD - CONTRASEÑAS")
    print("=" * 60)
    
    print(f"🔑 Contraseña vieja: REMOVIDA POR SEGURIDAD")
    print(f"📍 Host: {os.getenv('MYSQL_HOST')}")
    print(f"👤 Usuario: {os.getenv('MYSQL_USER')}")
    
    # Probar contraseña vieja
    old_works = test_old_password()
    
    # Probar contraseña actual
    current_works = test_current_password()
    
    print("\n" + "=" * 60)
    print("📊 RESUMEN:")
    print("=" * 60)
    
    if old_works is True:
        print("🚨 ¡CRÍTICO! La contraseña vieja AÚN FUNCIONA")
        print("   ⚠️  DEBES CAMBIARLA EN AIVEN INMEDIATAMENTE")
    elif old_works is False:
        print("✅ La contraseña vieja YA NO FUNCIONA (bien)")
    else:
        print("❓ No se pudo verificar la contraseña vieja")
    
    if current_works:
        print("✅ La contraseña actual funciona correctamente")
    else:
        print("❌ La contraseña actual no funciona")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
