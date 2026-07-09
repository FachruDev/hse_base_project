# Penyimpanan Limbah B3 API: Form 4

Semua endpoint membutuhkan:

```http
Authorization: Bearer {access_token}
```

Permission terkait:

- `b3storage.logs.create`: membuat log B3.
- `b3storage.logs.view-own`: melihat index/detail/foto log B3 milik sendiri.
- `b3storage.logs.view-all`: melihat semua index/detail/foto log B3.
- `b3storage.logs.view`: alias kompatibilitas lama untuk melihat semua log.
- `b3storage.logs.update`: update log B3.
- `b3storage.logs.delete`: hapus log B3.

Catatan: report dan approval bulanan B3 tidak tersedia di mobile API. Fitur tersebut tetap ada di dashboard web Laravel.

## GET /b3-storage/logs

Permission backend/UI: `b3storage.logs.view-own`, `b3storage.logs.view-all`, atau alias lama `b3storage.logs.view`.

Riwayat log penyimpanan limbah B3.

Scope data:

- `b3storage.logs.view-all`: semua log.
- `b3storage.logs.view-own`: hanya log dengan `operator_id` atau `initiator_user_id` milik user login.

Query optional:

- `month`: 1-12
- `year`: contoh `2026`
- `date_from`: format `YYYY-MM-DD`
- `date_to`: format `YYYY-MM-DD`
- `per_page`: default 50, maksimum 100

Jika `date_from` atau `date_to` dikirim, backend memakai filter rentang tanggal dan mengabaikan `month/year`. Jika kosong, backend tetap memakai filter bulan/tahun.

Response berupa pagination Laravel. Field penting:

- `movement_date`
- `movement_time`
- `movement_type`: `MASUK` atau `KELUAR`
- `waste_type` atau `waste_type_other`
- `initiator_department` atau `initiator_department_other`
- `weight_kg`
- `document_number`
- `photo_path`
- `operator`

## POST /b3-storage/logs

Permission backend/UI: `b3storage.logs.create`.

Membuat log B3. Gunakan `multipart/form-data` jika mengirim foto.

Master data untuk render form:

- `GET /b3-storage/master/waste-types` untuk pilihan jenis limbah.
- `GET /b3-storage/master/initiator-departments` untuk pilihan dept inisiator.

Field form yang disajikan:

- Nama petugas: otomatis dari user login, tidak perlu dikirim.
- Tanggal masuk/keluar: `movement_date`.
- Jam: `movement_time`.
- Jenis pergerakan: `movement_type` (`MASUK` atau `KELUAR`).
- Jenis limbah: `waste_type_id` atau `waste_type_other`.
- Berat limbah: `weight_kg`.
- Nomor dokumen: `document_number`.
- Dept inisiator: `initiator_department_id` atau `initiator_department_other`.
- Foto serah terima: `photo`.
- Catatan: `note`.

Fields:

```text
movement_date=2026-06-07
movement_time=14:30
movement_type=MASUK
waste_type_id=1
waste_type_other=
initiator_department_id=2
initiator_department_other=
weight_kg=50
document_number=03/HSE/XI/20
photo=@file.jpg
note=Catatan optional
```

Jika memilih "Yang lain" untuk jenis limbah:

```text
waste_type_id=
waste_type_other=Jenis limbah manual
```

Jika memilih "Yang lain" untuk dept inisiator:

```text
initiator_department_id=
initiator_department_other=Dept manual
```

Response 201:

```json
{
  "message": "Log penyimpanan limbah B3 berhasil dibuat.",
  "data": {
    "id": 1,
    "movement_date": "2026-06-07",
    "movement_time": "14:30",
    "movement_type": "MASUK",
    "weight_kg": "50.000",
    "document_number": "03/HSE/XI/20",
    "photo_path": "b3-storage/photos/file.jpg",
    "operator": {}
  }
}
```

Validasi foto:

- Field: `photo`
- Tipe: image
- Maksimum: 5 MB

## GET /b3-storage/logs/{log}

Permission backend/UI: `b3storage.logs.view-own`, `b3storage.logs.view-all`, atau alias lama `b3storage.logs.view`.

Detail satu log B3.

## PUT/PATCH /b3-storage/logs/{log}

Permission backend/UI: `b3storage.logs.update`.

Update log B3. Payload sama seperti create. Jika upload `photo` baru, file lama akan diganti.

## DELETE /b3-storage/logs/{log}

Permission backend/UI: `b3storage.logs.delete`.

Menghapus log B3 dan foto terkait.

## GET /b3-storage/logs/{log}/photo

Permission backend/UI: `b3storage.logs.view-own`, `b3storage.logs.view-all`, atau alias lama `b3storage.logs.view`.

Mengambil file foto log B3.

Header tetap memakai bearer token. Endpoint ini mengembalikan file image, bukan JSON.

## Laporan Bulanan B3

Endpoint `GET /b3-storage/monthly-report` dan `POST /b3-storage/monthly-report/approve` tidak tersedia di mobile API. Gunakan dashboard web Laravel untuk report, export, dan approval bulanan B3.
