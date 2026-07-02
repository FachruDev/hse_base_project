<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Checklist Pemeriksaan Harian IPAL - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 10px; }
        header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 12px; }
        h1 { margin: 0 0 4px; font-size: 18px; letter-spacing: .2px; }
        .muted { color: #6b7280; }
        .meta { text-align: right; line-height: 1.5; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
        .summary div { border: 1px solid #d1d5db; padding: 8px; }
        .summary strong { display: block; font-size: 13px; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #cbd5e1; padding: 4px 3px; vertical-align: middle; }
        th { background: #eef2f7; font-weight: 700; }
        .item { width: 150px; text-align: left; }
        .standard { width: 150px; text-align: left; }
        .day { width: 20px; text-align: center; }
        .status { text-align: center; font-weight: 700; }
        .ok { color: #047857; }
        .not-ok { color: #b91c1c; }
        .na { color: #6b7280; }
        .empty { color: #9ca3af; }
        footer { margin-top: 14px; display: flex; justify-content: space-between; gap: 20px; }
        .sign { width: 260px; border: 1px solid #d1d5db; padding: 8px; min-height: 66px; }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>Checklist Pemeriksaan Harian IPAL</h1>
            <div class="muted">Periode {{ $monthlyDetail['period']['label'] }}</div>
        </div>
        <div class="meta">
            <div>Dicetak: {{ now()->format('Y-m-d H:i') }}</div>
            <div>Status approval: {{ $monthlyDetail['approval']['status'] === 'APPROVED' ? 'Approved' : 'Belum approved' }}</div>
        </div>
    </header>

    <section class="summary">
        <div><span class="muted">Checklist terisi</span><strong>{{ $monthlyDetail['summary']['checklist_days_count'] }} hari</strong></div>
        <div><span class="muted">Catatan proses</span><strong>{{ $monthlyDetail['summary']['process_logs_count'] }} log</strong></div>
        <div><span class="muted">Batch mixing</span><strong>{{ $monthlyDetail['summary']['batch_mixing_logs_count'] }} log</strong></div>
        <div><span class="muted">Approval</span><strong>{{ $monthlyDetail['approval']['status'] === 'APPROVED' ? 'Approved' : 'Belum approved' }}</strong></div>
    </section>

    <table>
        <thead>
            <tr>
                <th class="item">Perlengkapan</th>
                @foreach ($monthlyDetail['period']['days'] as $day)
                    <th class="day">{{ $day['day'] }}</th>
                @endforeach
                <th class="standard">Kondisi Standar</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($monthlyDetail['checklist_matrix'] as $row)
                <tr>
                    <td class="item">{{ $row['name'] }}</td>
                    @foreach ($row['cells'] as $cell)
                        @php
                            $status = $cell['status'];
                            $label = match ($status) {
                                'OK' => 'OK',
                                'NOT_OK' => 'NO',
                                'NA' => 'NA',
                                default => '-',
                            };
                            $class = match ($status) {
                                'OK' => 'ok',
                                'NOT_OK' => 'not-ok',
                                'NA' => 'na',
                                default => 'empty',
                            };
                        @endphp
                        <td class="status {{ $class }}">{{ $label }}</td>
                    @endforeach
                    <td class="standard">{{ $row['standard_condition'] ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($monthlyDetail['period']['days']) + 2 }}" class="empty">
                        Belum ada data checklist pada periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <footer>
        <div class="muted">Legenda: OK = Berfungsi, NO = Tidak Berfungsi, NA = Tidak Berlaku.</div>
        <div class="sign">
            <strong>HSE Dept Head</strong><br>
            {{ $monthlyDetail['approval']['approved_by']['name'] ?? '-' }}<br>
            <span class="muted">{{ $monthlyDetail['approval']['approved_at'] ?? 'Belum approved' }}</span>
        </div>
    </footer>
</body>
</html>
