# Master Data API

Semua endpoint di file ini membutuhkan header:

```http
Authorization: Bearer {access_token}
```

Endpoint master data untuk mobile hanya read-only. CRUD master data dikelola dari dashboard/backoffice, bukan dari aplikasi Flutter.

## GET /master/checklist

Permission backend/UI: `master.checklist.view`.

Mengambil template dan item checklist pemeriksaan unit IPAL.

Dipakai untuk Form 2: Checklist Pemeriksaan Harian. Cara pengisiannya mengikuti web. Setiap baris checklist menampilkan:

- Perlengkapan: `items[].name`.
- Kondisi Standar: `items[].standard_condition`.
- Status: pilihan Ya/Tidak, default kosong/null sampai user memilih.
- Catatan: optional, dikirim sebagai `checklist.values[].note`.
- Lampiran: foto optional per baris, dikirim sebagai `checklist.values[].attachment`.

`items[].category` tetap dipakai untuk pengelompokan/perlengkapan proses.

Response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Checklist Harian",
      "is_active": true,
      "items": [
        {
          "id": 1,
          "template_id": 1,
          "name": "Water meter inlet",
          "category": "Penampungan Awal",
          "standard_condition": "Berfungsi, tidak tersumbat",
          "order_no": 1,
          "is_active": true
        }
      ]
    }
  ]
}
```

Status checklist yang dikirim saat submit IPAL:

- `OK`: Ya
- `NOT_OK`: Tidak
- Kosong/null: belum dipilih, jangan dikirim saat submit final.

## GET /master/process

Permission backend/UI: `master.process.view` dan `master.batch.view`.

Mengambil template catatan proses dan item batch mixing.

Dipakai untuk:

- Form 1: Catatan Proses Pengolahan Limbah Air.
- Form 3: Batch Mixing, sebagai section optional di dalam form catatan proses.

Field catatan proses yang perlu ditampilkan:

- `templates[].sections[].name`: kategori/unit proses.
- `templates[].sections[].items[].name`: uraian proses.
- `templates[].sections[].items[].standard_condition`: kondisi standar.
- Input user: kondisi aktual, dikirim sebagai `value_number` atau `value_text`.
- `process.values[].note`: keterangan optional.

Field batch mixing yang perlu ditampilkan:

- `batch_sections[].name`: proses batch, contoh `Air limbah awal`, `Netralisasi`, `Koagulasi`, `Flokulasi`.
- `batch_sections[].items[].name`: uraian batch per proses.
- `batch_sections[].items[].input_type`: tipe input batch.
- Di payload submit, batch dikirim per `batch_no`, masing-masing berisi semua `values`.

Response:

```json
{
  "data": {
    "templates": [
      {
        "id": 1,
        "name": "Catatan Proses IPAL",
        "sections": [
          {
            "id": 1,
            "name": "Penampungan Awal",
            "items": [
              {
                "id": 1,
                "label": "Debit inlet pada flow meter",
                "name": "Debit inlet pada flow meter",
                "standard_condition": "Berjalan",
                "input_type": "option_standard",
                "order_no": 1
              }
            ]
          }
        ]
      }
    ],
    "batch_sections": [
      {
        "id": 1,
        "name": "Air limbah awal",
        "order_no": 1,
        "items": [
          {
            "id": 1,
            "section_id": 1,
            "name": "pH",
            "input_type": "number",
            "order_no": 1
          }
        ]
      }
    ],
    "batch_items": [
      {
        "id": 1,
        "section_id": 1,
        "name": "pH",
        "input_type": "number",
        "order_no": 1
      }
    ]
  }
}
```

`batch_items` tetap tersedia untuk kompatibilitas, tetapi Flutter sebaiknya memakai `batch_sections` agar tampilan batch punya pemisah proses.

### Tipe Input IPAL

| `input_type` | Tampilan Flutter | Field submit |
| --- | --- | --- |
| `number` | Input angka. | `value_number` |
| `text` | Input teks bebas. | `value_text` |
| `select` | Dropdown/option dari konfigurasi master jika tersedia. | `value_text` |
| `option_standard` | Dropdown sederhana berbasis kondisi standar, dengan opsi aktual yang umum dipakai operator. | `value_text` |
| `option_with_manual` | Dropdown + opsi manual/lainnya. | `value_text` |

Untuk semua tipe selain `number`, backend memvalidasi nilai lewat `value_text`.

## B3 Master

### GET /b3-storage/master/waste-types

Permission backend/UI: `b3storage.master.view`.

List jenis limbah aktif/nonaktif. Pakai `id` untuk `waste_type_id`.

### GET /b3-storage/master/initiator-departments

Permission backend/UI: `b3storage.master.view`.

List dept inisiator aktif/nonaktif. Pakai `id` untuk `initiator_department_id`.

Kedua endpoint mengikuti response resource Laravel biasa. Untuk pilihan "Yang lain", kirim field `waste_type_other` atau `initiator_department_other` dan kosongkan id terkait.

Dipakai untuk Form 4 Penyimpanan Limbah B3:

- Jenis limbah: `waste_type_id` atau `waste_type_other`.
- Dept inisiator: `initiator_department_id` atau `initiator_department_other`.
