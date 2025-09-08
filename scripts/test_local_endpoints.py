#!/usr/bin/env python3
"""
Script simple para probar endpoints locales
"""

import requests
import json
import sys

def test_local_endpoints():
    """Probar endpoints en servidor local"""
    base_url = "http://localhost:8000"
    
    print("🧪 Probando endpoints locales...")
    print(f"🌐 Servidor: {base_url}")
    print("-" * 40)
    
    # Probar endpoint de salud
    print("\n1️⃣ Probando /debug/health:")
    try:
        response = requests.get(f"{base_url}/debug/health", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health Check - OK")
            print(f"   📄 Respuesta:")
            print(f"      Status: {data.get('status')}")
            print(f"      Environment: {data.get('environment')}")
            print(f"      Python Version: {data.get('python_version')}")
            print(f"      Database: {data.get('database')}")
        else:
            print(f"   ❌ Health Check - ERROR")
            print(f"   Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Error: No se puede conectar al servidor")
        print(f"   💡 Asegúrate de que el backend esté corriendo en localhost:8000")
    except requests.exceptions.Timeout:
        print(f"   ❌ Error: Timeout - el servidor no responde")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Probar endpoint de usuarios
    print("\n2️⃣ Probando GET /usuarios:")
    try:
        response = requests.get(f"{base_url}/usuarios", timeout=5)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ GET /usuarios - OK")
            print(f"   📄 Respuesta:")
            
            if isinstance(data, list):
                print(f"      Tipo: Lista con {len(data)} elementos")
                if len(data) == 0:
                    print(f"      ✅ Lista vacía: []")
                else:
                    print(f"      📋 Primeros usuarios:")
                    for i, usuario in enumerate(data[:3]):
                        print(f"         {i+1}. {usuario.get('nombre')} ({usuario.get('correo')})")
            else:
                print(f"      ❌ No es una lista: {type(data)}")
                print(f"      Contenido: {data}")
        else:
            print(f"   ❌ GET /usuarios - ERROR")
            print(f"   Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Error: No se puede conectar al servidor")
        print(f"   💡 Asegúrate de que el backend esté corriendo en localhost:8000")
    except requests.exceptions.Timeout:
        print(f"   ❌ Error: Timeout - el servidor no responde")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    print("\n" + "=" * 40)
    print("✅ Pruebas completadas")

if __name__ == "__main__":
    test_local_endpoints()
