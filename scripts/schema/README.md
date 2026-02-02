# 🔒 Database Schema - CONFIDENCIAL

## ⚠️ SEGURIDAD

Este directorio contiene los **schemas completos de la base de datos**. 

**NUNCA debe ser distribuido públicamente** porque:
- Expone la estructura interna de datos
- Revela relaciones y lógica de negocio
- Facilita ataques dirigidos (SQL injection, etc.)

## 📋 Contenido

- `create_database.sql` - Schema completo de producción
- `migrate_*.sql` - Migraciones de base de datos

## 👥 Acceso

- ✅ **Equipo de desarrollo** - Acceso completo
- ✅ **DevOps/SysAdmins** - Acceso para despliegue
- ❌ **Público** - NUNCA
- ❌ **Repositorios públicos** - NUNCA

## 🚀 Uso

Para desarrolladores locales:
```bash
# Crear base de datos
mysql -u root -p < scripts/schema/create_database.sql

# O con las migraciones
mysql -u root -p astrengpr < scripts/schema/migrate_v1.sql
```

Para documentación pública:
- Usar `create_database.sql.example` en root
- Incluye solo descripción de estructura
- Sin detalles de implementación sensibles

## ✅ Buenas Prácticas

1. **Nunca hacer commit** de este archivo sin .gitignore actualizado
2. **Incluir en backups** privados/encriptados
3. **Versionado en privado** (gitlab.com, github enterprise, etc.)
4. **Revisar cambios** antes de aplicar en producción
5. **Documentar migraciones** con explicación de qué cambió

## 📞 Preguntas

Si necesitas acceso al schema completo, contacta al equipo de DevOps.
