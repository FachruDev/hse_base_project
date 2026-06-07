# HSE Mobile API Docs

Dokumentasi ini untuk implementasi frontend Flutter. Semua endpoint memakai JSON, kecuali upload foto B3 yang memakai `multipart/form-data`.

## Base URL

Development lokal:

```text
http://127.0.0.1:8000/api
```

Production mengikuti domain server HSE.

## Auth

Mobile memakai bearer token.

1. Login: `POST /auth/login`
2. Simpan `data.access_token` di secure storage Flutter.
3. Kirim token di semua request berikutnya:

```http
Authorization: Bearer {access_token}
```

Auth query lama `?user_id=...` atau `?userid=...` masih didukung untuk kompatibilitas internal, tetapi mobile sebaiknya memakai bearer token.

## Standard Response

Single resource:

```json
{
  "message": "Berhasil.",
  "data": {}
}
```

Pagination Laravel:

```json
{
  "current_page": 1,
  "data": [],
  "first_page_url": "...",
  "last_page": 1,
  "per_page": 50,
  "total": 0
}
```

Validation error:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

## Modul Form

- Form 1: Checklist Pemeriksaan Unit IPAL, bagian dari endpoint IPAL.
- Form 2: Catatan Proses IPAL, bagian dari endpoint IPAL.
- Form 3: Proses Batch Mixing IPAL, optional dan melekat ke Catatan Proses.
- Form 4: Penyimpanan Limbah B3, endpoint B3 Storage.

## File Docs

- `auth.md`: login, profile, logout.
- `master-data.md`: master checklist, proses, batch, B3 waste type, department.
- `ipal.md`: endpoint form 1-3 IPAL.
- `b3-storage.md`: endpoint form 4 B3 dan report bulanan.
- `implementation-notes.md`: checklist implementasi Flutter dan catatan best practice.
