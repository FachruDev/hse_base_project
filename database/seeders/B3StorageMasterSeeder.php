<?php

namespace Database\Seeders;

use App\Models\B3Storage\B3StorageInitiatorDepartment;
use App\Models\B3Storage\B3StorageWasteType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class B3StorageMasterSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedWasteTypes();
            $this->seedInitiatorDepartments();
        });
    }

    private function seedWasteTypes(): void
    {
        $items = [
            'Produk/Bahan Awal Padat',
            'Produk/Bahan Awal Cair',
            'Chemical Lab',
            'Campuran/Used Rags',
            'Lampu TL Bekas',
            'Oli Bekas',
            'Lumpur IPAL',
        ];

        foreach ($items as $index => $name) {
            B3StorageWasteType::query()->updateOrCreate(
                ['name' => $name],
                [
                    'order_no' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }

    private function seedInitiatorDepartments(): void
    {
        $items = [
            'Business Development',
            'Engineering',
            'General Affair',
            'G. Bahan Awal',
            'G. Produk Jadi',
            'MPP',
            'P. Bedak',
            'P. Kosmetik 3',
            'P. Pharma',
            'P. Sabun',
            'QA',
            'QC',
            'R&D',
            'Toll In',
        ];

        foreach ($items as $index => $name) {
            B3StorageInitiatorDepartment::query()->updateOrCreate(
                ['name' => $name],
                [
                    'order_no' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
