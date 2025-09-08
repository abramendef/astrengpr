#!/usr/bin/env python3
"""
Script para probar el login en el servidor local
"""

import requests
import json

def test_login():
    """Probar login en el servidor local"""
    url = "http://localhost:8000/login"
    
    # Datos de prueba
    data = {
        "correo": "jesusmenfig@gmail.com",
        "contrasena": "test123"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("🔍 Probando login en servidor local...")
        print(f"📍 URL: {url}")
        print(f"📧 Correo: {data['correo']}")
        
        response = requests.post(url, json=data, headers=headers)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login exitoso!")
            return True
        else:
            print("❌ Login falló")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_health():
    """Probar endpoint de salud"""
    url = "http://localhost:8000/debug/health"
    
    try:
        print("\n🔍 Probando endpoint de salud...")
        response = requests.get(url)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 PRUEBA DE LOGIN EN SERVIDOR LOCAL")
    print("=" * 60)
    
    # Probar salud primero
    health_ok = test_health()
    
    if health_ok:
        # Probar login
        login_ok = test_login()
        
        print("\n" + "=" * 60)
        print("📊 RESUMEN:")
        print(f"   Servidor funcionando: {'✅ SÍ' if health_ok else '❌ NO'}")
        print(f"   Login funciona: {'✅ SÍ' if login_ok else '❌ NO'}")
        print("=" * 60)
    else:
        print("\n❌ El servidor no está funcionando correctamente")

if __name__ == "__main__":
    main()
