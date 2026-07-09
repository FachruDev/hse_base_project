# IPAL API: Form 1-3

Semua endpoint membutuhkan:

```http
Authorization: Bearer {access_token}
```

Permission terkait:

- `ipal.logs.create`: membuat draft/submit log IPAL harian.
- `ipal.logs.view-own`: melihat index/detail log IPAL milik sendiri.
- `ipal.logs.view-all`: melihat semua index/detail log IPAL.
- `ipal.logs.view`: alias kompatibilitas lama untuk melihat semua log.
- `ipal.logs.submit`: submit catatan proses harian.
- `ipal.logs.approve`: approve catatan proses harian.

## Struktur Form

Endpoint IPAL saat ini menyimpan 3 bagian dalam satu log harian:

- Form 1: catatan proses pengolahan limbah air, wajib untuk hari operasional.
- Form 2: checklist pemeriksaan harian, wajib.
- Form 3: batch mixing, optional. Isi hanya kalau ada proses mixing pada hari tersebut.

Satu operator hanya bisa membuat satu log IPAL per tanggal.

## Master Data untuk Render Form

Sebelum membuka form IPAL, Flutter perlu mengambil:

- `GET /master/checklist` untuk checklist pemeriksaan harian.
- `GET /master/process` untuk catatan proses dan batch mixing.

Catatan proses memiliki struktur:

- `sections[].name`: kategori proses/unit proses.
- `items[].name`: uraian proses.
- `items[].standard_condition`: kondisi standar.
- `items[].input_type`: menentukan komponen input kondisi aktual.
- `process.values[].note`: keterangan.
- `process.values[].attachment`: foto optional per uraian proses, sama seperti input foto di web.

Checklist harian memiliki struktur yang sama seperti web:

- Perlengkapan: `items[].name`.
- Kondisi Standar: `items[].standard_condition`.
- Status: Ya/Tidak dengan default kosong/null. Kirim `OK` untuk Ya dan `NOT_OK` untuk Tidak.
- Catatan: optional, kirim lewat `checklist.values[].note`.
- Lampiran: foto optional, kirim lewat `checklist.values[].attachment`.
- `items[].category`: kategori/perlengkapan untuk pengelompokan.

Batch mixing memiliki struktur:

- `batch_sections[].name`: proses batch.
- `batch_sections[].items[]`: item input per proses batch.
- Payload tetap dikirim sebagai `batch[].batch_no` dan `batch[].values[]`.

Mapping `input_type`:

| `input_type` | Field submit | Catatan |
| --- | --- | --- |
| `number` | `value_number` | Angka saja. |
| `text` | `value_text` | Free text. |
| `select` | `value_text` | Pilihan/dropdown. |
| `option_standard` | `value_text` | Pilihan aktual standar. |
| `option_with_manual` | `value_text` | Pilihan aktual standar + manual/lainnya. |

## GET /ipal/logs

Permission backend/UI: `ipal.logs.view-own`, `ipal.logs.view-all`, atau alias lama `ipal.logs.view`.

Riwayat log IPAL.

Scope data:

- `ipal.logs.view-all`: semua log.
- `ipal.logs.view-own`: hanya log dengan `operator_id` milik user login.

Query optional:

- `month`: 1-12
- `year`: contoh `2026`
- `date_from`: format `YYYY-MM-DD`
- `date_to`: format `YYYY-MM-DD`
- `per_page`: default 50, maksimum 100

Jika `date_from` atau `date_to` dikirim, backend memakai filter rentang tanggal dan mengabaikan `month/year`. Jika kosong, backend tetap memakai filter bulan/tahun.

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

Permission backend/UI: `ipal.logs.create`.

Membuat log IPAL harian. Gunakan `multipart/form-data` jika mengirim lampiran foto checklist atau catatan proses.

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
        "note": null,
        "attachment": null
      },
      {
        "item_id": 2,
        "status": "NOT_OK",
        "note": "Filter perlu dibersihkan",
        "attachment": "@foto-checklist.jpg"
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
        "note": null,
        "attachment": "@foto-process.jpg"
      },
      {
        "item_id": 11,
        "value_text": "Bersih",
        "value_number": null,
        "note": "Keterangan optional"
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

Contoh mapping batch mixing:

- Ambil daftar section dari `/master/process` field `batch_sections`.
- User menambah `Batch 1`, `Batch 2`, dan seterusnya.
- Untuk setiap batch, kirim nilai item berdasarkan `item_id` dari `batch_sections[].items[]`.

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
- Lampiran checklist optional per item memakai field `checklist[values][0][attachment]`, `checklist[values][1][attachment]`, dan seterusnya saat multipart.

## GET /ipal/logs/{log}

Permission backend/UI: `ipal.logs.view-own`, `ipal.logs.view-all`, atau alias lama `ipal.logs.view`.

Detail lengkap log IPAL, termasuk checklist, catatan proses, batch mixing, dan approval harian.

## POST /ipal/logs/{log}/submit

Permission backend/UI: `ipal.logs.submit`.

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

Permission backend/UI: `ipal.logs.approve`.

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
