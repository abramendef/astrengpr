#!/usr/bin/env python3
"""
Script simple para probar endpoints - funciona desde cualquier directorio
"""

import requests
import json
import sys
import os

def test_endpoints():
    """Probar endpoints en servidor local"""
    base_url = "http://localhost:8000"
    
    print("🧪 Probando endpoints locales...")
    print(f"🌐 Servidor: {base_url}")
    print("-" * 40)
    
    # Verificar si el servidor está corriendo
    try:
        response = requests.get(f"{base_url}/", timeout=3)
        print("✅ Servidor detectado")
    except:
        print("❌ Servidor no disponible")
        print("💡 Inicia el backend con: start_astren_nube.bat")
        return False
    
    # Probar endpoint de salud
    print("\n1️⃣ Probando /debug/health:")
    try:
        response = requests.get(f"{base_url}/debug/health", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health Check - OK")
            print(f"   📄 Status: {data.get('status')}")
            print(f"   📄 Environment: {data.get('environment')}")
            print(f"   📄 Python: {data.get('python_version')}")
            print(f"   📄 Database: {data.get('database')}")
        else:
            print(f"   ❌ Health Check - ERROR")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Probar endpoint de usuarios
    print("\n2️⃣ Probando GET /usuarios:")
    try:
        response = requests.get(f"{base_url}/usuarios", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ GET /usuarios - OK")
            
            if isinstance(data, list):
                print(f"   📄 Lista con {len(data)} usuarios")
                if len(data) == 0:
                    print(f"   ✅ Lista vacía: []")
                else:
                    print(f"   📋 Primeros usuarios:")
                    for i, usuario in enumerate(data[:3]):
                        print(f"      {i+1}. {usuario.get('nombre')} ({usuario.get('correo')})")
            else:
                print(f"   ❌ No es una lista: {type(data)}")
        else:
            print(f"   ❌ GET /usuarios - ERROR")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 40)
    print("✅ Pruebas completadas")
    return True

if __name__ == "__main__":
    test_endpoints()


