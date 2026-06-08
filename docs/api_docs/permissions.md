# Permission Matrix

Dokumen ini adalah acuan permission untuk Flutter. Permission dikirim dari `POST /auth/login` dan `GET /auth/me` pada field:

```json
{
  "data": {
    "user": {
      "permissions": ["ipal.logs.create"]
    }
  }
}
```

## Prinsip Implementasi

- Gunakan permission untuk show/hide menu, tombol submit, update, delete, approval, dan report.
- Jika backend mengembalikan `403`, tampilkan pesan bahwa user tidak memiliki akses.
- Jika permission tidak ada, jangan tampilkan action terkait.
- Endpoint master data untuk mobile bersifat read-only. Jangan gunakan endpoint CRUD master/admin dari aplikasi mobile.

## Master Data Read-Only

| Endpoint | Permission UI | Kegunaan |
| --- | --- | --- |
| `GET /master/checklist` | `master.checklist.view` | Dropdown/template checklist IPAL. |
| `GET /master/process` | `master.process.view` dan `master.batch.view` | Template catatan proses IPAL dan item batch mixing. |
| `GET /b3-storage/master/waste-types` | `b3storage.master.view` | Dropdown jenis limbah B3. |
| `GET /b3-storage/master/initiator-departments` | `b3storage.master.view` | Dropdown dept inisiator B3. |

## IPAL: Form 1-3

| Endpoint | Permission UI | Kegunaan |
| --- | --- | --- |
| `GET /ipal/logs` | `ipal.logs.view` | Riwayat/index log IPAL harian. |
| `POST /ipal/logs` | `ipal.logs.create` | Buat draft atau submit log IPAL harian. |
| `GET /ipal/logs/{log}` | `ipal.logs.view` | Detail checklist, catatan proses, dan batch mixing. |
| `POST /ipal/logs/{log}/submit` | `ipal.logs.submit` | Submit catatan proses harian oleh operator. |
| `POST /ipal/logs/{log}/approve` | `ipal.logs.approve` | Approve catatan proses harian oleh supervisor/HSE. |

## B3 Storage: Form 4

| Endpoint | Permission UI | Kegunaan |
| --- | --- | --- |
| `GET /b3-storage/logs` | `b3storage.logs.view` | Riwayat/index log B3. |
| `POST /b3-storage/logs` | `b3storage.logs.create` | Buat log B3 masuk/keluar. |
| `GET /b3-storage/logs/{log}` | `b3storage.logs.view` | Detail satu log B3. |
| `PUT/PATCH /b3-storage/logs/{log}` | `b3storage.logs.update` | Update log B3. |
| `DELETE /b3-storage/logs/{log}` | `b3storage.logs.delete` | Hapus log B3. |
| `GET /b3-storage/logs/{log}/photo` | `b3storage.logs.view` | Ambil foto bukti B3. |
| `GET /b3-storage/monthly-report` | `b3storage.monthly-report.view` | Report bulanan B3. |
| `POST /b3-storage/monthly-report/approve` | `b3storage.monthly-approval.approve` | Approval Environment Supervisor atau HSE Dept Head. |

## Role Default dari Seeder

| Role | Permission utama untuk mobile |
| --- | --- |
| `superadmin` | Semua permission. |
| `hse_admin` | Semua master, IPAL view/approve, dan B3 penuh. |
| `hse_supervisor` | Master read-only, IPAL view/approve, B3 report/approval. |
| `operator` | Master read-only, IPAL create/view/submit, B3 create/view/update/report. |

## Hal yang Belum Tercakup / Perlu Konfirmasi

- API IPAL belum punya endpoint report bulanan/matrix bulanan seperti web dashboard. API yang tersedia saat ini masih index/detail log harian, submit, dan approve harian.
- API IPAL belum punya endpoint approval checklist bulanan HSE Dept Head. Approval checklist bulanan saat ini tersedia di web dashboard.
- Master data IPAL sudah mengirim kategori proses, uraian proses, kondisi standar, tipe input, dan section batch. Namun opsi pilihan detail untuk `option_standard`/`option_with_manual` masih belum punya tabel option terpisah; Flutter dapat menampilkan pilihan umum dan tetap mengirim hasilnya sebagai `value_text`.
- Beberapa route API admin/master CRUD masih ada di backend, tetapi tidak masuk scope mobile. Mobile cukup memakai endpoint master read-only di dokumen ini.
- Sebagian endpoint API lama belum memakai middleware permission per route. Karena itu Flutter tetap wajib memakai daftar permission dari login/me untuk UX, dan backend permission hardening bisa dijadikan pekerjaan lanjutan.
- Belum ada endpoint upload/sync offline khusus. Jika Flutter butuh mode offline, perlu kontrak tambahan untuk conflict handling dan retry.
