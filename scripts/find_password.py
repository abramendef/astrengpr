#!/usr/bin/env python3
"""
Script para encontrar la contraseña correcta de jesusmenfig@gmail.com
"""

import os
import sys
import mysql.connector
import bcrypt
from dotenv import load_dotenv

# Agregar el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Cargar variables de entorno
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', 'env.local'))

def find_correct_password():
    """Buscar la contraseña correcta para jesusmenfig@gmail.com"""
    print("🔍 Buscando contraseña correcta para jesusmenfig@gmail.com...")
    
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
        
        # Obtener el usuario jesusmenfig@gmail.com
        cursor.execute("SELECT id, nombre, apellido, correo, contrasena FROM usuarios WHERE correo = %s", ("jesusmenfig@gmail.com",))
        usuario = cursor.fetchone()
        
        if usuario:
            print(f"✅ Usuario encontrado:")
            print(f"   ID: {usuario['id']}")
            print(f"   Nombre: {usuario['nombre']} {usuario['apellido']}")
            print(f"   Correo: {usuario['correo']}")
            print(f"   Hash de contraseña: {usuario['contrasena'][:30]}...")
            
            # Probar contraseñas comunes
            passwords_to_test = [
                "test123",
                "123456", 
                "password",
                "admin",
                "jesus123",
                "astren123",
                "jesusmenfig123",
                "jesus123456",
                "123456789",
                "qwerty",
                "abc123",
                "password123",
                "admin123",
                "root",
                "user",
                "login",
                "welcome",
                "hello",
                "world",
                "test"
            ]
            
            print(f"\n🔍 Probando contraseñas comunes...")
            for password in passwords_to_test:
                try:
                    if bcrypt.checkpw(password.encode('utf-8'), usuario['contrasena'].encode('utf-8')):
                        print(f"🎉 ¡CONTRASEÑA ENCONTRADA!")
                        print(f"   Contraseña: '{password}'")
                        print(f"   Usuario: {usuario['correo']}")
                        return password
                    else:
                        print(f"❌ '{password}' - No funciona")
                except Exception as e:
                    print(f"❌ Error probando '{password}': {e}")
            
            print(f"\n❌ No se encontró la contraseña correcta")
            print(f"💡 Posibles soluciones:")
            print(f"   1. Usar el usuario de prueba: test@localhost.com / test123")
            print(f"   2. Cambiar la contraseña desde la página web")
            print(f"   3. Resetear la contraseña desde la página web")
            
        else:
            print(f"❌ No se encontró el usuario jesusmenfig@gmail.com")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("=" * 60)
    print("🔍 BÚSQUEDA DE CONTRASEÑA CORRECTA")
    print("=" * 60)
    
    find_correct_password()

if __name__ == "__main__":
    main()
