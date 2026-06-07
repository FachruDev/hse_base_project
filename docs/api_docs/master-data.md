# Master Data API

Semua endpoint di file ini membutuhkan header:

```http
Authorization: Bearer {access_token}
```

## GET /master/checklist

Mengambil template dan item checklist pemeriksaan unit IPAL.

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
          "standard": "Berfungsi, tidak tersumbat",
          "order_no": 1,
          "is_active": true
        }
      ]
    }
  ]
}
```

Status checklist yang dikirim saat submit IPAL:

- `OK`: Berfungsi
- `NOT_OK`: Tidak Berfungsi
- `NA`: Tidak Berlaku

## GET /master/process

Mengambil template catatan proses dan item batch mixing.

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
                "input_type": "number",
                "standard": "Berjalan"
              }
            ]
          }
        ]
      }
    ],
    "batch_items": [
      {
        "id": 1,
        "label": "pH",
        "input_type": "number",
        "order_no": 1
      }
    ]
  }
}
```

`input_type = number` isi `value_number`. Selain itu isi `value_text`.

## B3 Master

### GET /b3-storage/master/waste-types

List jenis limbah aktif/nonaktif. Pakai `id` untuk `waste_type_id`.

### GET /b3-storage/master/initiator-departments

List dept inisiator aktif/nonaktif. Pakai `id` untuk `initiator_department_id`.

Kedua endpoint mengikuti response resource Laravel biasa. Untuk pilihan "Yang lain", kirim field `waste_type_other` atau `initiator_department_other` dan kosongkan id terkait.
