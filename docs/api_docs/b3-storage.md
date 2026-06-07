# Penyimpanan Limbah B3 API: Form 4

Semua endpoint membutuhkan:

```http
Authorization: Bearer {access_token}
```

## GET /b3-storage/logs

Riwayat log penyimpanan limbah B3.

Query optional:

- `month`: 1-12
- `year`: contoh `2026`
- `per_page`: default 50, maksimum 100

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

Membuat log B3. Gunakan `multipart/form-data` jika mengirim foto.

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

Detail satu log B3.

## PUT/PATCH /b3-storage/logs/{log}

Update log B3. Payload sama seperti create. Jika upload `photo` baru, file lama akan diganti.

## DELETE /b3-storage/logs/{log}

Menghapus log B3 dan foto terkait.

## GET /b3-storage/logs/{log}/photo

Mengambil file foto log B3.

Header tetap memakai bearer token. Endpoint ini mengembalikan file image, bukan JSON.

## GET /b3-storage/monthly-report

Report bulanan B3 sesuai format form fisik.

Query wajib:

- `month`: 1-12
- `year`: contoh `2026`

Example:

```http
GET /api/b3-storage/monthly-report?month=6&year=2026
```

Response 200:

```json
{
  "data": {
    "period": {
      "month": 6,
      "year": 2026,
      "label": "Juni 2026"
    },
    "columns": {
      "waste_types": [
        {
          "id": 1,
          "name": "Produk/Bahan Awal Padat",
          "order_no": 1
        }
      ],
      "has_other_column": true
    },
    "rows": [
      {
        "no": 1,
        "id": 10,
        "tanggal_masuk": "2026-06-07",
        "tanggal_keluar": null,
        "jam": "14:30",
        "weights_by_waste_type": {
          "1": "50.000"
        },
        "weight_other": null,
        "document_number": "03/HSE/XI/20",
        "initiator_department": "QC",
        "operator_name": "Irvan Maulana",
        "photo_path": "b3-storage/photos/file.jpg",
        "note": null
      }
    ],
    "totals": {
      "by_waste_type": {
        "1": 50
      },
      "other": 0,
      "overall": 50
    },
    "approval": {
      "status": "NOT_SUBMITTED",
      "environment_supervisor": {},
      "hse_department_head": {},
      "note": null
    }
  }
}
```

## POST /b3-storage/monthly-report/approve

Approval bulanan B3.

Request Environment Supervisor:

```json
{
  "month": 6,
  "year": 2026,
  "approval_role": "ENVIRONMENT_SUPERVISOR",
  "note": "Sudah diperiksa"
}
```

Request HSE Department Head:

```json
{
  "month": 6,
  "year": 2026,
  "approval_role": "HSE_DEPARTMENT_HEAD",
  "note": "Disetujui"
}
```

Urutan approval:

1. `ENVIRONMENT_SUPERVISOR`
2. `HSE_DEPARTMENT_HEAD`

Jika HSE approve sebelum Environment Supervisor, response 422:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "approval_role": [
      "Approval HSE Department Head menunggu approval Environment Supervisor."
    ]
  }
}
```
