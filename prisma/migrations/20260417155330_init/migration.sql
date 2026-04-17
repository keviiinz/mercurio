-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "punto_de_venta" TEXT NOT NULL DEFAULT 'base',
    "rol" TEXT NOT NULL DEFAULT 'operador',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_real" TEXT NOT NULL,
    "nombre_juego" TEXT NOT NULL,
    "bolsa_pavos" REAL NOT NULL DEFAULT 0,
    "bolsa_pesos" REAL NOT NULL DEFAULT 0,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Cuenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "pavos" INTEGER NOT NULL DEFAULT 0,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recarga" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cuenta_id" INTEGER NOT NULL,
    "pavos" INTEGER NOT NULL,
    "costo" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    CONSTRAINT "Recarga_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfiguracionSscm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "costo_por_100v" REAL NOT NULL,
    "precio_por_100v" REAL NOT NULL,
    "cashback_regalo" REAL NOT NULL,
    "cashback_codigo" REAL NOT NULL,
    "vigente_desde" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VentaSscm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cliente_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "configuracion_id" INTEGER NOT NULL,
    "cuenta_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "pavos_total" INTEGER NOT NULL,
    "pavos_cashback_usado" INTEGER NOT NULL DEFAULT 0,
    "pesos_cashback_usado" REAL NOT NULL DEFAULT 0,
    "pavos_por_conversion" INTEGER NOT NULL DEFAULT 0,
    "pavos_reales_pagados" INTEGER NOT NULL,
    "cashback_generado" REAL NOT NULL,
    "ajuste_dinero" REAL NOT NULL DEFAULT 0,
    "costo" REAL NOT NULL,
    "ingreso" REAL NOT NULL,
    "ganancia" REAL NOT NULL,
    "es_sorteo" BOOLEAN NOT NULL DEFAULT false,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    CONSTRAINT "VentaSscm_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VentaSscm_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "Periodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VentaSscm_configuracion_id_fkey" FOREIGN KEY ("configuracion_id") REFERENCES "ConfiguracionSscm" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VentaSscm_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "Cuenta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VentaSscm_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VentaBase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "total" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT
);

-- CreateTable
CREATE TABLE "ItemVenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unit" REAL NOT NULL,
    CONSTRAINT "ItemVenta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "VentaBase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemVenta_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nombre_juego_key" ON "Cliente"("nombre_juego");
