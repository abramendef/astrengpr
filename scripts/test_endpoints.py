#!/usr/bin/env python3
"""
Script para probar los endpoints de salud y usuarios
"""

import requests
import json
import sys
from datetime import datetime

def test_endpoint(url, endpoint_name, expected_status=200):
    """Probar un endpoint específico"""
    try:
        print(f"\n🔍 Probando {endpoint_name}: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ {endpoint_name} - OK")
            
            # Mostrar respuesta si es JSON
            try:
                data = response.json()
                print(f"   📄 Respuesta:")
                print(f"      {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                # Verificaciones específicas
                if endpoint_name == "Health Check":
                    if data.get('status') == 'healthy':
                        print(f"   ✅ Estado del servidor: HEALTHY")
                    else:
                        print(f"   ❌ Estado del servidor: {data.get('status')}")
                        
                elif endpoint_name == "GET /usuarios":
                    if isinstance(data, list):
                        print(f"   ✅ Retorna lista con {len(data)} usuarios")
                        if len(data) == 0:
                            print(f"   ✅ Lista vacía como se esperaba: []")
                        else:
                            print(f"   📋 Usuarios encontrados:")
                            for i, usuario in enumerate(data[:3]):  # Mostrar solo los primeros 3
                                print(f"      {i+1}. ID: {usuario.get('id')}, Nombre: {usuario.get('nombre')}, Correo: {usuario.get('correo')}")
                            if len(data) > 3:
                                print(f"      ... y {len(data) - 3} más")
                    else:
                        print(f"   ❌ No retorna una lista: {type(data)}")
                        
            except json.JSONDecodeError:
                print(f"   📄 Respuesta (texto): {response.text[:200]}...")
                
        else:
            print(f"   ❌ {endpoint_name} - ERROR (Status: {response.status_code})")
            print(f"   📄 Respuesta: {response.text[:200]}...")
            
        return response.status_code == expected_status
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ {endpoint_name} - ERROR DE CONEXIÓN: {e}")
        return False

def main():
    """Función principal"""
    print("=" * 60)
    print("🧪 PRUEBA DE ENDPOINTS - ASTREN")
    print("=" * 60)
    print(f"⏰ Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # URLs base para probar
    base_urls = [
        "http://localhost:8000",  # Local
        "https://astren-backend.onrender.com"  # Producción
    ]
    
    endpoints = [
        ("/debug/health", "Health Check"),
        ("/usuarios", "GET /usuarios")
    ]
    
    results = {}
    
    for base_url in base_urls:
        print(f"\n🌐 Probando servidor: {base_url}")
        print("-" * 50)
        
        server_results = {}
        
        for endpoint, name in endpoints:
            url = base_url + endpoint
            success = test_endpoint(url, name)
            server_results[name] = success
            
        results[base_url] = server_results
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    for base_url, server_results in results.items():
        print(f"\n🌐 {base_url}:")
        for endpoint_name, success in server_results.items():
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"   {endpoint_name}: {status}")
    
    # Verificar si todos los tests pasaron
    all_passed = all(
        all(server_results.values()) 
        for server_results in results.values()
    )
    
    if all_passed:
        print(f"\n🎉 ¡TODOS LOS TESTS PASARON!")
        sys.exit(0)
    else:
        print(f"\n⚠️  ALGUNOS TESTS FALLARON")
        sys.exit(1)

if __name__ == "__main__":
    main()


