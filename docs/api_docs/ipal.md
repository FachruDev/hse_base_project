# IPAL API: Form 1-3

Semua endpoint membutuhkan:

```http
Authorization: Bearer {access_token}
```

Permission terkait:

- `ipal.logs.create`: membuat draft/submit log IPAL harian.
- `ipal.logs.view`: melihat index/detail log IPAL.
- `ipal.logs.submit`: submit catatan proses harian.
- `ipal.logs.approve`: approve catatan proses harian.

## Struktur Form

Endpoint IPAL saat ini menyimpan 3 bagian dalam satu log harian:

- Form 1: checklist pemeriksaan unit, wajib.
- Form 2: catatan proses, wajib untuk hari operasional.
- Form 3: batch mixing, optional. Isi hanya kalau ada proses mixing pada hari tersebut.

Satu operator hanya bisa membuat satu log IPAL per tanggal.

## GET /ipal/logs

Permission UI: `ipal.logs.view`.

Riwayat log IPAL.

Query optional:

- `month`: 1-12
- `year`: contoh `2026`
- `per_page`: default 50, maksimum 100

Example:

```http
GET /api/ipal/logs?month=6&year=2026&per_page=20
```

Response berupa pagination Laravel. Field penting per row:

- `tanggal`
- `operator`
- `checklist`
- `process_log.status`: `DRAFT`, `SUBMITTED`, `APPROVED`
- `process_log.batches`: ada data berarti ada batch mixing

## POST /ipal/logs

Permission UI: `ipal.logs.create`.

Membuat log IPAL harian.

Request draft dengan checklist + proses:

```json
{
  "tanggal": "2026-06-07",
  "action": "DRAFT",
  "checklist": {
    "template_id": 1,
    "values": [
      {
        "item_id": 1,
        "status": "OK",
        "note": null
      },
      {
        "item_id": 2,
        "status": "NOT_OK",
        "note": "Filter perlu dibersihkan"
      }
    ]
  },
  "process": {
    "template_id": 1,
    "values": [
      {
        "item_id": 10,
        "value_number": 7.1,
        "value_text": null,
        "note": null
      },
      {
        "item_id": 11,
        "value_text": "Bersih",
        "value_number": null,
        "note": null
      }
    ]
  },
  "batch": []
}
```

Request dengan batch mixing:

```json
{
  "tanggal": "2026-06-07",
  "action": "SUBMIT",
  "checklist": {
    "template_id": 1,
    "values": [
      {
        "item_id": 1,
        "status": "OK"
      }
    ]
  },
  "process": {
    "template_id": 1,
    "values": [
      {
        "item_id": 10,
        "value_number": 7.1
      }
    ]
  },
  "batch": [
    {
      "batch_no": 1,
      "values": [
        {
          "item_id": 1,
          "value_number": 6.8
        },
        {
          "item_id": 2,
          "value_text": "Jernih"
        }
      ]
    }
  ]
}
```

Response 201:

```json
{
  "message": "Log IPAL berhasil disimpan.",
  "data": {
    "id": 1,
    "tanggal": "2026-06-07",
    "operator": {},
    "checklist": {},
    "process_log": {}
  }
}
```

Catatan:

- `action = DRAFT` menyimpan sebagai draft.
- `action = SUBMIT` langsung menandatangani operator dan status proses menjadi `SUBMITTED`.
- Untuk hari non-operasional, API akan mengisi checklist sebagai `NA` dan tidak bisa submit harian.

## GET /ipal/logs/{log}

Permission UI: `ipal.logs.view`.

Detail lengkap log IPAL, termasuk checklist, catatan proses, batch mixing, dan approval harian.

## POST /ipal/logs/{log}/submit

Permission UI: `ipal.logs.submit`.

Submit catatan proses harian oleh operator.

Response:

```json
{
  "message": "Log IPAL berhasil di-submit.",
  "data": {
    "id": 1,
    "status": "SUBMITTED",
    "approval": {}
  }
}
```

## POST /ipal/logs/{log}/approve

Permission UI: `ipal.logs.approve`.

Approve catatan proses harian oleh user supervisor/HSE yang berwenang.

Response:

```json
{
  "message": "Log IPAL berhasil di-approve.",
  "data": {
    "id": 1,
    "status": "APPROVED",
    "approval": {}
  }
}
```

Catatan implementasi mobile:

- Ambil master checklist dari `/master/checklist`.
- Ambil master catatan proses dan batch dari `/master/process`.
- Tampilkan batch mixing sebagai section optional di bawah catatan proses.
- Jangan hardcode id item; selalu pakai id dari master data.
- API IPAL saat ini belum menyediakan report bulanan/matrix bulanan dan approval checklist bulanan. Fitur tersebut sudah ada di web dashboard, tetapi belum masuk kontrak API mobile.
