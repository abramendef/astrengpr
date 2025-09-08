#!/usr/bin/env python3
"""
Script para verificar usuarios en la base de datos
"""

import os
import sys
import mysql.connector
from dotenv import load_dotenv

# Agregar el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Cargar variables de entorno
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', 'env.local'))

def check_users():
    """Verificar usuarios en la base de datos"""
    print("🔍 Verificando usuarios en la base de datos...")
    
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
        
        # Obtener todos los usuarios
        cursor.execute("SELECT id, nombre, apellido, correo, contrasena FROM usuarios ORDER BY id")
        usuarios = cursor.fetchall()
        
        print(f"\n📊 Total de usuarios: {len(usuarios)}")
        print("=" * 80)
        
        for usuario in usuarios:
            print(f"ID: {usuario['id']}")
            print(f"Nombre: {usuario['nombre']} {usuario['apellido']}")
            print(f"Correo: {usuario['correo']}")
            print(f"Contraseña hash: {usuario['contrasena'][:30]}...")
            print("-" * 40)
        
        cursor.close()
        conn.close()
        
        return usuarios
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def test_password_hash():
    """Probar diferentes contraseñas comunes"""
    print("\n🔍 Probando contraseñas comunes...")
    
    import bcrypt
    
    # Contraseñas comunes para probar
    passwords_to_test = [
        "test123",
        "123456",
        "password",
        "admin",
        "jesus123",
        "astren123"
    ]
    
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
        
        # Obtener el primer usuario
        cursor.execute("SELECT correo, contrasena FROM usuarios LIMIT 1")
        usuario = cursor.fetchone()
        
        if usuario:
            print(f"Probando contraseñas para: {usuario['correo']}")
            print(f"Hash almacenado: {usuario['contrasena'][:30]}...")
            
            for password in passwords_to_test:
                try:
                    if bcrypt.checkpw(password.encode('utf-8'), usuario['contrasena'].encode('utf-8')):
                        print(f"✅ ¡CONTRASEÑA ENCONTRADA! '{password}' funciona")
                        return password
                    else:
                        print(f"❌ '{password}' no funciona")
                except Exception as e:
                    print(f"❌ Error probando '{password}': {e}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

def main():
    print("=" * 80)
    print("🔍 VERIFICACIÓN DE USUARIOS EN BASE DE DATOS")
    print("=" * 80)
    
    # Verificar usuarios
    usuarios = check_users()
    
    if usuarios:
        # Probar contraseñas
        password_found = test_password_hash()
        
        if password_found:
            print(f"\n🎉 ¡SOLUCIÓN ENCONTRADA!")
            print(f"Usa la contraseña: '{password_found}'")
        else:
            print(f"\n💡 SUGERENCIAS:")
            print(f"1. Verifica que estés usando el mismo correo que en la web")
            print(f"2. Si cambiaste la contraseña en la web, úsala aquí también")
            print(f"3. Si no recuerdas la contraseña, puedes resetearla desde la web")

if __name__ == "__main__":
    main()
