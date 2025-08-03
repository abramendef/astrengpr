# 🚀 Guía de Despliegue de Astren - Internet

## ⚡ **OPCIÓN RECOMENDADA: Render.com (Gratis)**

### **Ventajas:**
- ✅ **Completamente gratis** para proyectos pequeños
- ✅ **Despliegue automático** desde GitHub
- ✅ **SSL automático** (https://)
- ✅ **Dominio personalizado** opcional
- ✅ **Base de datos MySQL** incluida
- ✅ **Sin configuración compleja**

### **Pasos para Desplegar en Render:**

#### **1. Preparar el Repositorio (5 minutos)**
```bash
# Crear archivo para Render
echo "web: python app.py" > backend/Procfile

# Crear archivo de configuración
echo "PORT=8000" > backend/.env
```

#### **2. Crear Cuenta en Render (2 minutos)**
1. Ve a [render.com](https://render.com)
2. Regístrate con tu GitHub
3. Haz clic en "New Web Service"

#### **3. Conectar tu Repositorio (1 minuto)**
1. Selecciona tu repositorio de Astren
2. Configuración automática:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/app.py`
   - **Environment**: Python 3

#### **4. Configurar Base de Datos (3 minutos)**
1. En Render Dashboard → "New Database"
2. Selecciona "MySQL"
3. Copia las credenciales de conexión
4. Actualiza `backend/app.py` con las nuevas credenciales

#### **5. Desplegar Frontend (5 minutos)**
1. "New Static Site"
2. Conecta tu repositorio
3. **Build Command**: `cp -r frontend/* .`
4. **Publish Directory**: `.`

### **Resultado Final:**
- 🌐 **Backend**: `https://tu-app.onrender.com`
- 🌐 **Frontend**: `https://tu-frontend.onrender.com`

---

## 🔥 **OPCIÓN ALTERNATIVA: Railway.app (Gratis)**

### **Ventajas:**
- ✅ **Más simple** que Render
- ✅ **Despliegue instantáneo**
- ✅ **Base de datos incluida**

### **Pasos:**
1. Ve a [railway.app](https://railway.app)
2. Conecta tu GitHub
3. Selecciona tu repositorio
4. Railway detectará automáticamente que es Python
5. Agrega una base de datos MySQL
6. ¡Listo!

---

## ⚡ **OPCIÓN EXPRÉS: Vercel + Railway**

### **Para Mañana (30 minutos total):**

#### **Backend en Railway:**
1. Sube tu código a GitHub
2. Conecta Railway con tu repo
3. Railway desplegará automáticamente el backend

#### **Frontend en Vercel:**
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu GitHub
3. Selecciona tu repositorio
4. Configura:
   - **Framework Preset**: Other
   - **Build Command**: `cp -r frontend/* .`
   - **Output Directory**: `.`

---

## 🔧 **Configuración Necesaria**

### **1. Actualizar config.js**
```javascript
// Cambiar de localhost a tu dominio
const API_BASE_URL = 'https://tu-backend.onrender.com';
```

### **2. Configurar CORS en backend**
```python
# En app.py, agregar:
from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins=['https://tu-frontend.vercel.app'])
```

### **3. Variables de Entorno**
```bash
# En Render/Railway, configurar:
DATABASE_URL=mysql://usuario:password@host:puerto/database
FLASK_ENV=production
```

---

## 📱 **URLs para tu Equipo**

Una vez desplegado, tu equipo podrá acceder a:

- 🌐 **Aplicación Principal**: `https://tu-app.vercel.app`
- 🔧 **API**: `https://tu-backend.onrender.com`
- 📧 **Credenciales de Prueba**: 
  - Email: `abraham@example.com`
  - Password: `password123`

---

## ⚠️ **Consideraciones Importantes**

### **Para Mañana:**
1. **Base de datos**: Usa la de Render/Railway (no local)
2. **CORS**: Configura para permitir tu frontend
3. **Variables de entorno**: Configura en el dashboard
4. **Pruebas**: Verifica que todo funcione antes de enviar

### **Limitaciones Gratuitas:**
- **Render**: 750 horas/mes gratis
- **Railway**: $5/mes después de prueba
- **Vercel**: 100GB/mes gratis

---

## 🎯 **Plan de Acción para Mañana**

### **Mañana Temprano (1 hora):**
1. ✅ Subir código a GitHub (si no está)
2. ✅ Desplegar backend en Render/Railway
3. ✅ Desplegar frontend en Vercel
4. ✅ Configurar base de datos
5. ✅ Probar login y funcionalidades básicas

### **Antes de Enviar al Equipo:**
1. ✅ Verificar que el login funcione
2. ✅ Probar crear tareas y grupos
3. ✅ Verificar que las estadísticas se muestren
4. ✅ Probar en diferentes navegadores

### **Enviar al Equipo:**
- 🌐 **Link principal**: `https://tu-app.vercel.app`
- 📧 **Credenciales**: `abraham@example.com` / `password123`
- 📋 **Instrucciones**: "Pueden crear sus propias cuentas o usar las de prueba"

---

## 🚨 **Solución de Problemas Rápidos**

### **Si el backend no responde:**
- Verificar variables de entorno en Render/Railway
- Revisar logs en el dashboard
- Verificar que la base de datos esté conectada

### **Si el frontend no carga:**
- Verificar que la URL del backend esté correcta en `config.js`
- Revisar la consola del navegador para errores CORS
- Verificar que el build se completó correctamente

### **Si no se conecta a la base de datos:**
- Verificar credenciales en variables de entorno
- Asegurar que la base de datos esté activa
- Revisar logs del backend

---

## 🎉 **¡Listo para tu Exposición!**

Con cualquiera de estas opciones tendrás:
- ✅ **URL pública** para tu equipo
- ✅ **HTTPS seguro**
- ✅ **Base de datos en la nube**
- ✅ **Acceso desde cualquier lugar**
- ✅ **Funcionalidad completa**

**¡Tu equipo podrá probar Astren desde cualquier dispositivo con internet!** 