#!/usr/bin/env python3
"""
Script para crear un usuario de prueba con credenciales conocidas
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

def create_test_user():
    """Crear un usuario de prueba con credenciales conocidas"""
    print("🔧 Creando usuario de prueba...")
    
    # Credenciales del usuario de prueba
    test_email = "test@localhost.com"
    test_password = "test123"
    test_name = "Usuario"
    test_lastname = "Prueba"
    
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
        
        # Verificar si el usuario ya existe
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (test_email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"⚠️  El usuario {test_email} ya existe (ID: {existing_user[0]})")
            print("🔄 Actualizando contraseña...")
            
            # Actualizar contraseña del usuario existente
            hashed_password = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt(rounds=10))
            cursor.execute(
                "UPDATE usuarios SET contrasena = %s WHERE correo = %s",
                (hashed_password.decode('utf-8'), test_email)
            )
            conn.commit()
            print("✅ Contraseña actualizada correctamente")
            
        else:
            print(f"➕ Creando nuevo usuario: {test_email}")
            
            # Crear nuevo usuario
            hashed_password = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt(rounds=10))
            cursor.execute(
                "INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (%s, %s, %s, %s)",
                (test_name, test_lastname, test_email, hashed_password.decode('utf-8'))
            )
            conn.commit()
            print("✅ Usuario creado correctamente")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("🎉 USUARIO DE PRUEBA LISTO")
        print("=" * 60)
        print(f"📧 Correo: {test_email}")
        print(f"🔑 Contraseña: {test_password}")
        print(f"👤 Nombre: {test_name} {test_lastname}")
        print("=" * 60)
        print("💡 Ahora puedes usar estas credenciales en localhost")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_login_with_new_user():
    """Probar login con el usuario de prueba"""
    print("\n🧪 Probando login con el usuario de prueba...")
    
    import requests
    
    url = "http://localhost:8000/login"
    data = {
        "correo": "test@localhost.com",
        "contrasena": "test123"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ ¡Login exitoso con usuario de prueba!")
            return True
        else:
            print("❌ Login falló")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_usuarios_endpoint():
    """Probar el endpoint GET /usuarios"""
    print("\n🧪 Probando endpoint GET /usuarios...")
    
    import requests
    
    url = "http://localhost:8000/usuarios"
    
    try:
        response = requests.get(url)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint funciona - {len(data)} usuarios encontrados")
            print(f"📝 Primeros 3 usuarios:")
            for i, user in enumerate(data[:3]):
                print(f"   {i+1}. {user.get('nombre', 'N/A')} {user.get('apellido', 'N/A')} ({user.get('correo', 'N/A')})")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🔧 CREACIÓN DE USUARIO DE PRUEBA PARA LOCALHOST")
    print("=" * 60)
    
    # Crear usuario de prueba
    user_created = create_test_user()
    
    if user_created:
        # Probar login
        login_ok = test_login_with_new_user()
        
        # Probar endpoint usuarios
        usuarios_ok = test_usuarios_endpoint()
        
        print("\n" + "=" * 60)
        print("📊 RESUMEN FINAL:")
        print(f"   Usuario creado: {'✅ SÍ' if user_created else '❌ NO'}")
        print(f"   Login funciona: {'✅ SÍ' if login_ok else '❌ NO'}")
        print(f"   GET /usuarios funciona: {'✅ SÍ' if usuarios_ok else '❌ NO'}")
        print("=" * 60)
        
        if login_ok and usuarios_ok:
            print("\n🎉 ¡PROBLEMA RESUELTO!")
            print("💡 Ahora puedes usar localhost con las credenciales:")
            print("   📧 Correo: test@localhost.com")
            print("   🔑 Contraseña: test123")

if __name__ == "__main__":
    main()
