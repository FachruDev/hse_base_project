<?php

namespace Database\Seeders;

use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessItem;
use App\Models\Master\ProcessSection;
use App\Models\Master\ProcessTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IpalMasterDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedChecklist();
            $this->seedProcess();
            $this->seedBatch();
        });
    }

    private function seedChecklist(): void
    {
        $template = ChecklistTemplate::query()->updateOrCreate(
            ['name' => 'Checklist Pemeriksaan Harian Unit Instalasi Pengolahan Air Limbah'],
            ['is_active' => true],
        );

        $items = [
            ['name' => 'Water meter inlet', 'category' => 'Penampungan Awal', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Filter inlet', 'category' => 'Penampungan Awal', 'standard_condition' => 'Bersih, tidak tersumbat'],
            ['name' => 'Pompa Transfer 1 (Penampungan awal)', 'category' => 'Penampungan Awal', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Pipa Oil trap', 'category' => 'Perangkap Lemak/Minyak', 'standard_condition' => 'Bersih, tidak tersumbat'],
            ['name' => 'Pompa Transfer 2 (Ekualisasi)', 'category' => 'Ekualisasi', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'Panel', 'category' => 'Utilitas', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'Inverter', 'category' => 'Utilitas', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'Mixer', 'category' => 'Sedimentasi Kimia', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'pH meter', 'category' => 'Verifikasi pH Meter', 'standard_condition' => 'Tersedia siap pakai'],
            ['name' => 'Larutan CaOH2', 'category' => 'Chemical', 'standard_condition' => 'Tersedia siap pakai'],
            ['name' => 'Larutan P.A.C', 'category' => 'Chemical', 'standard_condition' => 'Tersedia siap pakai'],
            ['name' => 'Larutan Polimer', 'category' => 'Chemical', 'standard_condition' => 'Tersedia siap pakai'],
            ['name' => 'Filtrasi karbon aktif', 'category' => 'Filtrasi', 'standard_condition' => 'Bersih, berfungsi, tidak tersumbat'],
            ['name' => 'Pompa Transfer 3 (Sedimentasi Kimia)', 'category' => 'Sedimentasi Kimia', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Root Blower', 'category' => 'Aerasi', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'Instalasi Aerasi', 'category' => 'Aerasi', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'Clarifier', 'category' => 'Clarifier', 'standard_condition' => 'Berfungsi, aman'],
            ['name' => 'Pompa Return Lumpur', 'category' => 'Clarifier', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Pompa filter', 'category' => 'Filtrasi', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Multi media filter', 'category' => 'Filtrasi', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Karbon aktif filter', 'category' => 'Filtrasi', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
            ['name' => 'Water meter outlet', 'category' => 'Outlet', 'standard_condition' => 'Berfungsi, tidak tersumbat'],
        ];

        foreach ($items as $index => $item) {
            ChecklistItem::query()->updateOrCreate(
                [
                    'template_id' => $template->id,
                    'name' => $item['name'],
                ],
                [
                    'category' => $item['category'],
                    'standard_condition' => $item['standard_condition'],
                    'order_no' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }

    private function seedProcess(): void
    {
        $template = ProcessTemplate::query()->updateOrCreate(
            ['name' => 'Formulir Catatan Proses Pengolahan Air Limbah'],
            ['is_active' => true],
        );

        $sections = [
            'Penampungan Awal' => [
                ['name' => 'Debit inlet pada flow meter', 'standard_condition' => 'Berjalan', 'input_type' => 'number'],
                ['name' => 'Penyaringan sampah kasar', 'standard_condition' => 'Saringan bersih tidak tersumbat', 'input_type' => 'text'],
            ],
            'Perangkap Lemak/Minyak' => [
                ['name' => 'Kondisi endapan lemak/minyak', 'standard_condition' => 'Warna muda', 'input_type' => 'text'],
                ['name' => 'Efluent', 'standard_condition' => 'Warna putih pekat', 'input_type' => 'text'],
            ],
            'Ekualisasi' => [
                ['name' => 'Kepekatan air limbah', 'standard_condition' => 'Pekat', 'input_type' => 'text'],
                ['name' => 'Warna air limbah', 'standard_condition' => 'Muda', 'input_type' => 'text'],
                ['name' => 'pH', 'standard_condition' => 'pH 4 - 10', 'input_type' => 'number'],
            ],
            'Sedimentasi Kimia' => [
                ['name' => 'Transparansi', 'standard_condition' => 'Jernih', 'input_type' => 'text'],
                ['name' => 'Warna', 'standard_condition' => 'Muda terang', 'input_type' => 'text'],
                ['name' => 'Monitoring pH', 'standard_condition' => 'pH 6 - 9', 'input_type' => 'number'],
                ['name' => 'Masukan udara', 'standard_condition' => 'Berfungsi, udara merata', 'input_type' => 'text'],
            ],
            'Aerasi (Lumpur Aktif)' => [
                ['name' => 'Warna', 'standard_condition' => 'Muda terang', 'input_type' => 'text'],
                ['name' => 'Lumpur (SV 30)', 'standard_condition' => '20% - 50%, warna coklat terang', 'input_type' => 'text'],
                ['name' => 'Busa', 'standard_condition' => 'Putih tipis', 'input_type' => 'text'],
            ],
            'Clarifier' => [
                ['name' => 'Transparansi', 'standard_condition' => 'Jernih', 'input_type' => 'text'],
                ['name' => 'Warna', 'standard_condition' => 'Muda terang', 'input_type' => 'text'],
                ['name' => 'Pengembalian lumpur', 'standard_condition' => 'Segar, warna coklat terang', 'input_type' => 'text'],
            ],
            'Stabilisasi' => [
                ['name' => 'Transparansi', 'standard_condition' => 'Jernih', 'input_type' => 'text'],
                ['name' => 'Warna', 'standard_condition' => 'Muda terang', 'input_type' => 'text'],
                ['name' => 'pH', 'standard_condition' => 'pH 6 - 9', 'input_type' => 'number'],
            ],
            'Filtrasi' => [
                ['name' => 'Kondisi media & karbon aktif filter', 'standard_condition' => 'Effluent jernih', 'input_type' => 'text'],
            ],
            'Outlet / Titik Sampling' => [
                ['name' => 'Kran', 'standard_condition' => 'Bersih, tidak tersumbat', 'input_type' => 'text'],
                ['name' => 'Angka pada water meter', 'standard_condition' => 'Terbaca', 'input_type' => 'number'],
                ['name' => 'Kondisi visual air outlet', 'standard_condition' => 'Tidak berwarna, tidak berbusa', 'input_type' => 'text'],
            ],
            'Bio Indikator' => [
                ['name' => 'Air', 'standard_condition' => 'Jernih, tidak berbusa', 'input_type' => 'text'],
                ['name' => 'Ikan', 'standard_condition' => 'Sehat, jumlah sesuai standar', 'input_type' => 'text'],
            ],
            'Drying Bed' => [
                ['name' => 'Kondisi lumpur', 'standard_condition' => 'Kering', 'input_type' => 'text'],
                ['name' => 'Berat lumpur (Kg)', 'standard_condition' => 'Tercatat', 'input_type' => 'number'],
            ],
            'Verifikasi pH Meter' => [
                ['name' => 'pH 4', 'standard_condition' => '3,08 - 4,08', 'input_type' => 'number'],
                ['name' => 'pH 7', 'standard_condition' => '6,44 - 7,14', 'input_type' => 'number'],
                ['name' => 'pH 9 atau pH 10', 'standard_condition' => '8,28 - 9,18 atau 9,2 - 10,2', 'input_type' => 'number'],
            ],
        ];

        $sectionOrder = 1;

        foreach ($sections as $sectionName => $items) {
            $section = ProcessSection::query()->updateOrCreate(
                [
                    'template_id' => $template->id,
                    'name' => $sectionName,
                ],
                [
                    'order_no' => $sectionOrder,
                ],
            );

            foreach ($items as $itemOrder => $item) {
                ProcessItem::query()->updateOrCreate(
                    [
                        'section_id' => $section->id,
                        'name' => $item['name'],
                    ],
                    [
                        'standard_condition' => $item['standard_condition'],
                        'input_type' => $item['input_type'],
                        'order_no' => $itemOrder + 1,
                    ],
                );
            }

            $sectionOrder++;
        }
    }

    private function seedBatch(): void
    {
        $items = [
            ['name' => 'Air limbah awal - pH', 'input_type' => 'number'],
            ['name' => 'Air limbah awal - Warna', 'input_type' => 'text'],
            ['name' => 'Netralisasi - Jumlah Chemical', 'input_type' => 'number'],
            ['name' => 'Netralisasi - pH', 'input_type' => 'number'],
            ['name' => 'Netralisasi - Waktu', 'input_type' => 'text'],
            ['name' => 'Netralisasi - Warna', 'input_type' => 'text'],
            ['name' => 'Koagulasi - Jumlah Chemical', 'input_type' => 'number'],
            ['name' => 'Koagulasi - pH', 'input_type' => 'number'],
            ['name' => 'Koagulasi - Waktu', 'input_type' => 'text'],
            ['name' => 'Koagulasi - Warna', 'input_type' => 'text'],
            ['name' => 'Flokulasi - Jumlah Chemical', 'input_type' => 'number'],
            ['name' => 'Flokulasi - pH', 'input_type' => 'number'],
            ['name' => 'Flokulasi - Waktu', 'input_type' => 'text'],
            ['name' => 'Flokulasi - Warna', 'input_type' => 'text'],
        ];

        foreach ($items as $index => $item) {
            BatchItem::query()->updateOrCreate(
                ['name' => $item['name']],
                [
                    'input_type' => $item['input_type'],
                    'order_no' => $index + 1,
                ],
            );
        }
    }
}
