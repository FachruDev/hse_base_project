# Flutter Implementation Notes

## Checklist Minimum

1. Login dengan `POST /auth/login`.
2. Simpan token di secure storage.
3. Tambahkan interceptor HTTP untuk header `Authorization: Bearer {token}`.
4. Jika response 401, hapus token lokal dan arahkan user ke login.
5. Jika response 422, tampilkan error field dari object `errors`.
6. Ambil master data sebelum membuka form IPAL atau B3.
7. Jangan hardcode id master data karena bisa berubah dari admin.

## Permission

Response login dan `/auth/me` mengembalikan `permissions`. Frontend bisa memakai ini untuk menampilkan/menyembunyikan tombol. Detail matriks endpoint ada di `permissions.md`.

- `master.checklist.view`: baca master checklist IPAL.
- `master.process.view`: baca master catatan proses IPAL.
- `master.batch.view`: baca master batch mixing IPAL.
- `ipal.logs.create`: input IPAL.
- `ipal.logs.view`: lihat riwayat/detail IPAL.
- `ipal.logs.submit`: submit catatan proses IPAL.
- `ipal.logs.approve`: approve catatan proses IPAL.
- `b3storage.master.view`: baca master jenis limbah dan dept inisiator B3.
- `b3storage.logs.create`: input B3.
- `b3storage.logs.view`: lihat riwayat/detail/foto B3.
- `b3storage.logs.update`: update B3.
- `b3storage.logs.delete`: delete B3.
- `b3storage.monthly-report.view`: lihat report bulanan B3.
- `b3storage.monthly-approval.approve`: approval bulanan B3.

Catatan: endpoint mobile untuk master form, IPAL, B3 Storage, report, dan approval sudah memblokir permission di backend. Beberapa endpoint API backoffice lama masih kompatibel dengan auth `user_id`; untuk mobile, tetap gunakan daftar permission di atas untuk UX dan koordinasi role.

## Scope Endpoint Mobile

Gunakan hanya endpoint yang didokumentasikan di folder ini:

- Auth.
- Master data read-only untuk dropdown.
- IPAL form 1-3.
- B3 Storage form 4 dan report/approval bulanan.

Jangan gunakan endpoint admin, role, permission, atau CRUD master data dari mobile. Endpoint tersebut untuk dashboard/backoffice.

## Upload Foto B3 di Flutter

Gunakan multipart request:

- Text fields sesuai `b3-storage.md`.
- File field bernama `photo`.
- Content-Type akan diatur otomatis oleh HTTP client saat multipart.

## Date and Time Format

- Date: `YYYY-MM-DD`, contoh `2026-06-07`.
- Time: `HH:mm`, contoh `14:30`.
- Month report: `month` integer 1-12 dan `year` integer.

## IPAL Status Labels

Backend menyimpan kode:

- `OK`
- `NOT_OK`
- `NA`

Label checklist harian harus mengikuti web:

- `OK`: `Ya`
- `NOT_OK`: `Tidak`
- Kosong/null: belum dipilih.

## B3 Movement Labels

Backend menyimpan kode:

- `MASUK`: limbah masuk ke TPS LB3.
- `KELUAR`: limbah keluar dari TPS LB3.

## Recommended Screen Flow

IPAL:

1. Load `/master/checklist` dan `/master/process`.
2. Tampilkan checklist pemeriksaan unit seperti web: Perlengkapan, Kondisi Standar, Status Ya/Tidak default kosong, Catatan optional, dan Lampiran foto optional.
3. Tampilkan catatan proses.
4. Tampilkan batch mixing sebagai section optional.
5. Save draft dengan `action = DRAFT` atau submit dengan `action = SUBMIT`.

B3:

1. Load `/b3-storage/master/waste-types`.
2. Load `/b3-storage/master/initiator-departments`.
3. Input log `MASUK` atau `KELUAR`.
4. Upload foto bila tersedia.
5. Gunakan monthly report untuk layar rekap bulanan.
