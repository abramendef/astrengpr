#!/usr/bin/env python3
"""
Script para probar la conexión a la base de datos de Aiven desde localhost
"""

import os
import sys
import mysql.connector
from mysql.connector import pooling as mysql_pooling
from dotenv import load_dotenv

# Agregar el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Cargar variables de entorno
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', 'env.local'))

def test_connection_without_ssl():
    """Probar conexión sin SSL"""
    print("🔍 Probando conexión SIN SSL...")
    
    try:
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=int(os.getenv('MYSQL_PORT')),
            connection_timeout=10
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]
        print(f"✅ Conexión exitosa SIN SSL - {count} usuarios encontrados")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error SIN SSL: {e}")
        return False

def test_connection_with_ssl():
    """Probar conexión con SSL"""
    print("\n🔍 Probando conexión CON SSL...")
    
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
        print(f"✅ Conexión exitosa CON SSL - {count} usuarios encontrados")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error CON SSL: {e}")
        return False

def test_user_login():
    """Probar login de usuario"""
    print("\n🔍 Probando login de usuario...")
    
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
        
        cursor = conn.cursor(dictionary=True)
        
        # Buscar un usuario de prueba
        cursor.execute("SELECT id, correo, contrasena FROM usuarios LIMIT 1")
        usuario = cursor.fetchone()
        
        if usuario:
            print(f"✅ Usuario encontrado: {usuario['correo']}")
            print(f"📝 Contraseña hash: {usuario['contrasena'][:20]}...")
        else:
            print("❌ No se encontraron usuarios")
            
        cursor.close()
        conn.close()
        return usuario is not None
        
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 PRUEBA DE CONEXIÓN AIVEN DESDE LOCALHOST")
    print("=" * 60)
    
    # Mostrar configuración
    print(f"\n📋 Configuración:")
    print(f"   Host: {os.getenv('MYSQL_HOST')}")
    print(f"   Usuario: {os.getenv('MYSQL_USER')}")
    print(f"   Base de datos: {os.getenv('MYSQL_DATABASE')}")
    print(f"   Puerto: {os.getenv('MYSQL_PORT')}")
    
    # Probar conexiones
    ssl_works = test_connection_with_ssl()
    no_ssl_works = test_connection_without_ssl()
    
    if ssl_works:
        test_user_login()
    
    print("\n" + "=" * 60)
    print("📊 RESUMEN:")
    print(f"   SSL requerido: {'✅ SÍ' if ssl_works and not no_ssl_works else '❌ NO'}")
    print(f"   Conexión funciona: {'✅ SÍ' if ssl_works or no_ssl_works else '❌ NO'}")
    print("=" * 60)

if __name__ == "__main__":
    main()
