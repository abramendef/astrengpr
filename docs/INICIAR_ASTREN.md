# 🚀 Cómo Iniciar Astren - Local y Producción

## Acceso Rápido (Recomendado)

**Doble clic en:** `start_astren.bat`

Este archivo iniciará automáticamente:
- ✅ **Backend API** en http://localhost:8000
- ✅ **Frontend** en http://localhost:5500

## Alternativa Manual

Si prefieres usar PowerShell directamente:

```powershell
.\scripts\start_servers.ps1
```

## URLs de Acceso

### **🌍 Producción (Recomendado)**
- 🌐 **Aplicación Principal**: https://astren.vercel.app/
- 🔧 **API Backend**: https://astren-backend.onrender.com
- 🗄️ **Base de Datos**: Aiven MySQL

### **💻 Desarrollo Local**
Una vez iniciados los servidores:
- 🌐 **Aplicación Principal**: http://localhost:5500
- 🔧 **API Backend**: http://localhost:8000


## Requisitos

- Python 3.13 (o versión compatible)
- Dependencias instaladas: `pip install -r backend/requirements.txt`

## Solución de Problemas

### **Local:**
Si hay conflictos de puertos, el script los resolverá automáticamente.
Si tienes problemas, cierra todas las ventanas de terminal y vuelve a intentar.

### **Producción:**
El sistema está completamente desplegado y funcionando. Si hay problemas:
- Verifica que estés usando las URLs correctas de producción
- El sistema se actualiza automáticamente desde GitHub

## 🎯 **Recomendación**

**Para uso normal**: Usa directamente https://astren.vercel.app/
**Para desarrollo**: Usa el modo local con `start_astren.bat`

---

**Última actualización**: 27 de Agosto de 2025
**Versión**: 0.0.6
**Estado**: Completamente desplegado y funcional ✅ 