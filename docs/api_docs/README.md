# HSE Mobile API Docs

Dokumentasi ini untuk implementasi frontend Flutter. Semua endpoint memakai JSON, kecuali upload foto B3 dan lampiran foto checklist IPAL yang memakai `multipart/form-data`.

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

Login mobile memakai payload `login` dan `password`. `login` boleh berisi user ID/external ID atau email. Default awal rollout untuk user lama/seeder adalah `Gpl12345!`, lalu admin bisa menggantinya dari Management User.

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

## Scope Mobile API

Dokumentasi ini hanya mencakup kebutuhan mobile:

- Auth mobile: login, profile, logout.
- CRUD pengisian 4 form operasional.
- Index/detail/report yang dibutuhkan operator, supervisor, dan dept head.
- Master data read-only untuk dropdown/pilihan form.

Endpoint admin, role, permission, dan CRUD master data backoffice tidak termasuk scope mobile walaupun beberapa route masih ada di backend untuk kebutuhan dashboard/internal.

## Modul Form

- Form 1: Checklist Pemeriksaan Unit IPAL, bagian dari endpoint IPAL.
- Form 2: Catatan Proses IPAL, bagian dari endpoint IPAL.
- Form 3: Proses Batch Mixing IPAL, optional dan melekat ke Catatan Proses.
- Form 4: Penyimpanan Limbah B3, endpoint B3 Storage.

## Permission

Response `POST /auth/login` dan `GET /auth/me` mengembalikan array `permissions`. Flutter sebaiknya memakai permission ini untuk menampilkan tombol dan membatasi action user.

Detail matriks permission ada di `permissions.md`.

## File Docs

- `auth.md`: login, profile, logout.
- `permissions.md`: matriks endpoint, permission, dan catatan gap.
- `master-data.md`: master checklist, proses, batch, B3 waste type, department.
- `ipal.md`: endpoint form 1-3 IPAL.
- `b3-storage.md`: endpoint form 4 B3 dan report bulanan.
- `implementation-notes.md`: checklist implementasi Flutter dan catatan best practice.
