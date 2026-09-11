from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.permissions import router as permissions_router

# ==========================================================
# DATABASE
# ==========================================================

from app.core.database import Base, engine
import app.models


# ==========================================================
# API ROUTER
# ==========================================================

from app.api import auth
from app.api import barang
from app.api import kategori
from app.api import supplier
from app.api import pelanggan
from app.api import muamalah
from app.api import ai

from app.api.dashboard import router as dashboard_router

from app.api.pembelian import router as pembelian_router
from app.api.penjualan import router as penjualan_router

from app.api.retur_pembelian import (
    router as retur_pembelian_router
)

from app.api.v1.retur_penjualan import (
    router as retur_penjualan_router
)

from app.api.stok import router as stok_router

from app.api.mutasi_stok import (
    router as mutasi_stok_router
)

from app.api.laporan import (
    router as laporan_router
)

from app.api import settings
from app.api import toko
from app.api import users
# ==========================================================
# AI KITAB KUNING
# ==========================================================

from app.api.kitab_kuning import (
    router as kitab_kuning_router
)


# ==========================================================
# CREATE DATABASE TABLE
# ==========================================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================================
# FASTAPI
# ==========================================================

app = FastAPI(
    title="Kasir AI API",
    version="1.0.0",
    debug=True,
)
from fastapi import Request

@app.get("/api/v1/debug-auth")
async def debug_auth(request: Request):
    return {
        "authorization_present": bool(
            request.headers.get("authorization")
        ),
        "host": request.headers.get("host"),
    }
import os

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


print(
    "ID APP SETELAH DIBUAT :",
    id(app)
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",

        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================================
# AUTH
# ==========================================================

print("SEBELUM AUTH")

app.include_router(
    auth.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH AUTH")


# ==========================================================
# MASTER - BARANG
# ==========================================================

print("SEBELUM BARANG")

app.include_router(
    barang.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH BARANG")


# ==========================================================
# MASTER - KATEGORI
# ==========================================================

print("SEBELUM KATEGORI")

app.include_router(
    kategori.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH KATEGORI")


# ==========================================================
# MASTER - SUPPLIER
# ==========================================================

print("SEBELUM SUPPLIER")

app.include_router(
    supplier.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH SUPPLIER")


# ==========================================================
# MASTER - PELANGGAN
# ==========================================================

print("SEBELUM PELANGGAN")

app.include_router(
    pelanggan.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH PELANGGAN")


# ==========================================================
# AI CORE
# ==========================================================

print("SEBELUM AI CORE")

app.include_router(
    ai.router,
    prefix="/api/v1/ai",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes),
)

print("SESUDAH AI CORE")


# ==========================================================
# AI MUAMALAH
# ==========================================================

print("SEBELUM AI MUAMALAH")

app.include_router(
    muamalah.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH AI MUAMALAH")


# ==========================================================
# DASHBOARD
# ==========================================================

print("SEBELUM DASHBOARD")

app.include_router(
    dashboard_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH DASHBOARD")


# ==========================================================
# PEMBELIAN
# ==========================================================

print("SEBELUM PEMBELIAN")

app.include_router(
    pembelian_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH PEMBELIAN")


# ==========================================================
# PENJUALAN
# ==========================================================

print("SEBELUM PENJUALAN")

app.include_router(
    penjualan_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH PENJUALAN")


# ==========================================================
# RETUR PEMBELIAN
# ==========================================================

print("SEBELUM RETUR PEMBELIAN")

app.include_router(
    retur_pembelian_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH RETUR PEMBELIAN")


# ==========================================================
# RETUR PENJUALAN
# ==========================================================

print("SEBELUM RETUR PENJUALAN")

app.include_router(
    retur_penjualan_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH RETUR PENJUALAN")


# ==========================================================
# STOK
# ==========================================================

print("SEBELUM STOK")

app.include_router(
    stok_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH STOK")


# ==========================================================
# MUTASI STOK
# ==========================================================

print("SEBELUM MUTASI STOK")

app.include_router(
    mutasi_stok_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH MUTASI STOK")


# ==========================================================
# LAPORAN
# ==========================================================

print("SEBELUM LAPORAN")

app.include_router(
    laporan_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH LAPORAN")


# ==========================================================
# AI KITAB KUNING
# ==========================================================

print("SEBELUM AI KITAB KUNING")

app.include_router(
    kitab_kuning_router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH AI KITAB KUNING")


# ==========================================================
# DEBUG ROUTES
# ==========================================================

print("\n" + "=" * 70)

print(
    "SEMUA ROUTE YANG TERDAFTAR"
)

print("=" * 70)


for route in app.routes:

    if hasattr(route, "path"):

        methods = getattr(
            route,
            "methods",
            None
        )

        if methods:

            print(
                f"{','.join(sorted(methods)):<15} "
                f"{route.path}"
            )

    else:

        print(
            "OBJECT :",
            type(route)
        )


print("=" * 70 + "\n")


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
def root():

    return {
        "message": "Kasir AI Backend Running",
        "version": "1.0.0",
    }

# ==========================================================
# USERS
# ==========================================================

print("SEBELUM USERS")

app.include_router(
    users.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH USERS")


# ==========================================================
# SETTING TOKO
# ==========================================================

print("SEBELUM SETTING TOKO")

app.include_router(
    settings.router,
    prefix="/api/v1",
)

print(
    "JUMLAH ROUTE :",
    len(app.routes)
)

print("SESUDAH SETTING TOKO")

app.include_router(
    toko.router,
    prefix="/api/v1",
)

app.include_router(
    permissions_router,
    prefix="/api/v1",
)