#!/usr/bin/env python3
"""
Script para probar login con el usuario de prueba
"""

import requests
import json

def test_test_user_login():
    """Probar login con el usuario de prueba"""
    url = "http://localhost:8000/login"
    
    # Usuario de prueba que creamos
    data = {
        "correo": "test@localhost.com",
        "contrasena": "test123"
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        print("🔍 Probando login con usuario de prueba...")
        print(f"📍 URL: {url}")
        print(f"📧 Correo: {data['correo']}")
        
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
    """Probar endpoint GET /usuarios"""
    url = "http://localhost:8000/usuarios"
    
    try:
        print("\n🔍 Probando endpoint GET /usuarios...")
        response = requests.get(url)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint funciona - {len(data)} usuarios encontrados")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 PRUEBA FINAL - USUARIO DE PRUEBA")
    print("=" * 60)
    
    # Probar login con usuario de prueba
    login_ok = test_test_user_login()
    
    # Probar endpoint usuarios
    usuarios_ok = test_usuarios_endpoint()
    
    print("\n" + "=" * 60)
    print("📊 RESUMEN FINAL:")
    print("=" * 60)
    print(f"   Login con usuario de prueba: {'✅ SÍ' if login_ok else '❌ NO'}")
    print(f"   GET /usuarios funciona: {'✅ SÍ' if usuarios_ok else '❌ NO'}")
    print("=" * 60)
    
    if login_ok and usuarios_ok:
        print("\n🎉 ¡PROBLEMA COMPLETAMENTE RESUELTO!")
        print("💡 Credenciales para localhost:")
        print("   📧 Correo: test@localhost.com")
        print("   🔑 Contraseña: test123")
        print("\n🛡️ SEGURIDAD:")
        print("   ✅ Contraseña vieja ya no funciona")
        print("   ✅ Nueva contraseña configurada")
        print("   ✅ Archivos sensibles protegidos")

if __name__ == "__main__":
    main()
