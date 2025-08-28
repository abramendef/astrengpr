#!/usr/bin/env python3
"""
Aplica índices recomendados en MySQL para Astren (local y nube).

Uso:
  - Con archivo de entorno:
      python scripts/apply_indexes.py --env-file backend/env.production
  - Con parámetros explícitos:
      python scripts/apply_indexes.py --host localhost --user root --password 1234 --database astren --port 3306

Seguro: verifica existencia en information_schema antes de crear.
"""

import argparse
import os
import sys
from typing import List, Tuple

try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None

import mysql.connector


IndexDef = Tuple[str, str, str]  # (table_name, index_name, column_list_sql)


INDEXES: List[IndexDef] = [
    ("tareas", "idx_tareas_usuario_estado_fecha", "(usuario_id, estado, fecha_creacion)"),
    ("tareas", "idx_tareas_asignado_estado_fecha", "(asignado_a_id, estado, fecha_creacion)"),
    ("tareas", "idx_tareas_grupo_estado_fecha", "(grupo_id, estado, fecha_creacion)"),
    ("tareas", "idx_tareas_area_estado", "(area_id, estado)"),
    ("notificaciones", "idx_notif_usuario_leida", "(usuario_id, leida)"),
    # miembros_grupo ya tiene PK (grupo_id, usuario_id); añadimos el inverso
    ("miembros_grupo", "idx_mg_usuario_grupo", "(usuario_id, grupo_id)"),
    # Opcionales útiles
    ("grupos", "idx_grupos_estado_nombre", "(estado, nombre)"),
]


def connect_mysql(host: str, user: str, password: str, database: str, port: int):
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        connection_timeout=10,
    )


def index_exists(cursor, db_name: str, table: str, index: str) -> bool:
    cursor.execute(
        """
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = %s AND table_name = %s AND index_name = %s
        LIMIT 1
        """,
        (db_name, table, index),
    )
    return cursor.fetchone() is not None


def ensure_index(cursor, db_name: str, table: str, index: str, columns_sql: str) -> bool:
    if index_exists(cursor, db_name, table, index):
        print(f"[=] Index ya existe: {table}.{index}")
        return False
    ddl = f"CREATE INDEX {index} ON {table} {columns_sql}"
    print(f"[+] Creando index: {ddl}")
    cursor.execute(ddl)
    return True


def analyze_tables(cursor, tables: List[str]):
    for t in tables:
        try:
            cursor.execute(f"ANALYZE TABLE {t}")
            # Consumir resultados para evitar 'Unread result'
            _ = cursor.fetchall()
        except Exception as e:
            print(f"[!] ANALYZE falló en {t}: {e}")


def load_env(env_file: str | None):
    if env_file:
        if load_dotenv is None:
            print("[WARN] python-dotenv no instalado, ignorando --env-file")
        else:
            if not os.path.isfile(env_file):
                print(f"[ERROR] No existe env file: {env_file}")
                sys.exit(1)
            load_dotenv(env_file)


def resolve_config(args) -> dict:
    # Prioridad: CLI -> ENV -> defaults
    cfg = {
        "host": args.host or os.getenv("MYSQL_HOST") or os.getenv("DB_HOST") or "localhost",
        "user": args.user or os.getenv("MYSQL_USER") or os.getenv("DB_USER") or "root",
        "password": args.password or os.getenv("MYSQL_PASSWORD") or os.getenv("DB_PASSWORD") or "",
        "database": args.database or os.getenv("MYSQL_DATABASE") or os.getenv("DB_NAME") or "astren",
        "port": int(args.port or os.getenv("MYSQL_PORT") or os.getenv("DB_PORT") or 3306),
    }
    return cfg


def main():
    parser = argparse.ArgumentParser(description="Aplica índices MySQL para Astren")
    parser.add_argument("--env-file", dest="env_file", default=None, help="Ruta a archivo .env a cargar")
    parser.add_argument("--host", dest="host", default=None)
    parser.add_argument("--user", dest="user", default=None)
    parser.add_argument("--password", dest="password", default=None)
    parser.add_argument("--database", dest="database", default=None)
    parser.add_argument("--port", dest="port", default=None)
    args = parser.parse_args()

    load_env(args.env_file)
    cfg = resolve_config(args)
    print("[INFO] Conectando:", {k: ("****" if k == "password" else v) for k, v in cfg.items()})

    conn = connect_mysql(**cfg)
    cursor = conn.cursor()

    created = 0
    for tbl, idx, cols in INDEXES:
        try:
            if ensure_index(cursor, cfg["database"], tbl, idx, cols):
                created += 1
        except Exception as e:
            print(f"[ERROR] No se pudo crear {tbl}.{idx}: {e}")

    if created:
        conn.commit()
        analyze_tables(cursor, list({t for (t, _, _) in INDEXES}))

    cursor.close()
    conn.close()
    print(f"[DONE] Índices creados: {created}")


if __name__ == "__main__":
    main()


