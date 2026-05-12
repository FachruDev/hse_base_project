<?php

namespace Tests\Feature\Database;

use App\Models\Master\BatchItem;
use App\Models\Master\ChecklistItem;
use App\Models\Master\ChecklistTemplate;
use App\Models\Master\ProcessItem;
use App\Models\Master\ProcessSection;
use App\Models\Master\ProcessTemplate;
use Database\Seeders\IpalMasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IpalMasterDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_ipal_master_data_from_form_definition(): void
    {
        $this->seed(IpalMasterDataSeeder::class);

        $checklistTemplate = ChecklistTemplate::query()->where('name', 'Checklist Pemeriksaan Harian Unit Instalasi Pengolahan Air Limbah')->first();
        $processTemplate = ProcessTemplate::query()->where('name', 'Formulir Catatan Proses Pengolahan Air Limbah')->first();

        $this->assertNotNull($checklistTemplate);
        $this->assertNotNull($processTemplate);
        $this->assertSame(22, ChecklistItem::query()->where('template_id', $checklistTemplate->id)->count());
        $this->assertSame(12, ProcessSection::query()->where('template_id', $processTemplate->id)->count());
        $this->assertSame(31, ProcessItem::query()->count());
        $this->assertSame(14, BatchItem::query()->count());
    }
}
