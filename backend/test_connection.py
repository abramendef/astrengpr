#!/usr/bin/env python3
"""
Script para probar la conexión a la base de datos Aiven
"""
import os
import sys
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
import ssl

def test_connection():
    """Probar conexión a la base de datos"""
    
    # Cargar configuración
    if os.path.exists('env.local'):
        load_dotenv('env.local')
        print("✅ Cargando configuración desde env.local")
    elif os.path.exists('env.production'):
        load_dotenv('env.production')
        print("✅ Cargando configuración desde env.production")
    else:
        load_dotenv()
        print("✅ Cargando configuración desde .env")
    
    # Obtener variables de entorno
    host = os.getenv('MYSQL_HOST')
    port = int(os.getenv('MYSQL_PORT', 3306))
    user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')
    database = os.getenv('MYSQL_DATABASE')
    ssl_mode = os.getenv('MYSQL_SSL_MODE', 'REQUIRED')
    
    print(f"\n🔧 Configuración de conexión:")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   User: {user}")
    print(f"   Database: {database}")
    print(f"   SSL Mode: {ssl_mode}")
    
    # Configurar SSL
    ssl_config = {}
    if ssl_mode == 'REQUIRED':
        ssl_config = {
            'ssl_disabled': False,
            'ssl_verify_cert': False,  # Para pruebas, deshabilitar verificación
            'ssl_verify_identity': False
        }
        print("   SSL: Habilitado (verificación deshabilitada para pruebas)")
    else:
        ssl_config = {'ssl_disabled': True}
        print("   SSL: Deshabilitado")
    
    connection = None
    try:
        print(f"\n🔄 Intentando conectar a la base de datos...")
        
        # Intentar conexión
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            **ssl_config,
            connection_timeout=30,
            autocommit=True
        )
        
        if connection.is_connected():
            print("✅ ¡Conexión exitosa!")
            
            # Obtener información del servidor
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"   Versión MySQL: {version[0]}")
            
            # Probar una consulta simple
            cursor.execute("SELECT COUNT(*) FROM usuarios")
            count = cursor.fetchone()
            print(f"   Usuarios en la base de datos: {count[0]}")
            
            # Probar consulta de áreas
            cursor.execute("SELECT COUNT(*) FROM areas")
            areas_count = cursor.fetchone()
            print(f"   Áreas en la base de datos: {areas_count[0]}")
            
            cursor.close()
            
    except Error as e:
        print(f"❌ Error de conexión: {e}")
        print(f"   Código de error: {e.errno}")
        print(f"   Mensaje SQL: {e.msg}")
        
        # Sugerencias de solución
        if e.errno == 2003:
            print("\n💡 Posibles soluciones:")
            print("   1. Verificar que el host y puerto sean correctos")
            print("   2. Verificar que el firewall permita la conexión")
            print("   3. Verificar que Aiven esté funcionando")
        elif e.errno == 1045:
            print("\n💡 Posibles soluciones:")
            print("   1. Verificar usuario y contraseña")
            print("   2. Verificar que el usuario tenga permisos")
        elif e.errno == 2006:
            print("\n💡 Posibles soluciones:")
            print("   1. El servidor MySQL se desconectó")
            print("   2. Verificar configuración SSL")
        elif "SSL" in str(e):
            print("\n💡 Posibles soluciones:")
            print("   1. Probar sin SSL (cambiar MYSQL_SSL_MODE=DISABLED)")
            print("   2. Verificar certificados SSL")
            print("   3. Usar ssl_verify_cert=False")
        
        return False
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False
        
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("   Conexión cerrada correctamente")
    
    return True

def test_without_ssl():
    """Probar conexión sin SSL"""
    print("\n🔄 Probando conexión SIN SSL...")
    
    # Cargar configuración
    if os.path.exists('env.local'):
        load_dotenv('env.local')
    elif os.path.exists('env.production'):
        load_dotenv('env.production')
    else:
        load_dotenv()
    
    host = os.getenv('MYSQL_HOST')
    port = int(os.getenv('MYSQL_PORT', 3306))
    user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')
    database = os.getenv('MYSQL_DATABASE')
    
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl_disabled=True,  # Deshabilitar SSL completamente
            connection_timeout=30,
            autocommit=True
        )
        
        if connection.is_connected():
            print("✅ ¡Conexión exitosa SIN SSL!")
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"   Versión MySQL: {version[0]}")
            cursor.close()
            return True
            
    except Error as e:
        print(f"❌ Error sin SSL: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            connection.close()
    
    return False

if __name__ == "__main__":
    print("🚀 Iniciando diagnóstico de conexión a base de datos Aiven")
    print("=" * 60)
    
    # Probar con SSL primero
    success = test_connection()
    
    if not success:
        # Si falla con SSL, probar sin SSL
        success = test_without_ssl()
        
        if success:
            print("\n💡 SOLUCIÓN ENCONTRADA:")
            print("   La conexión funciona SIN SSL.")
            print("   Cambia MYSQL_SSL_MODE=DISABLED en env.local")
        else:
            print("\n❌ No se pudo conectar con ninguna configuración SSL")
            print("   Revisa la configuración de la base de datos")
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 Diagnóstico completado - Conexión exitosa")
    else:
        print("💥 Diagnóstico completado - Problemas encontrados")

