<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>FM070 Checklist IPAL - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.25; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #111827; padding: 3px 4px; vertical-align: middle; }
        th { font-weight: 700; text-align: center; }
        .document { border: 1px solid #111827; min-height: 190mm; }
        .header { display: grid; grid-template-columns: 120px 1fr 180px; border-bottom: 1px solid #111827; }
        .header > div { padding: 7px 8px; border-right: 1px solid #111827; min-height: 54px; }
        .header > div:last-child { border-right: 0; }
        .brand { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; text-align: center; }
        .title { text-align: center; }
        .title h1 { margin: 7px 0 0; font-size: 14px; text-transform: uppercase; }
        .meta td { border: 0; padding: 1px 0; }
        .content { padding: 8px; }
        .period { margin-bottom: 6px; }
        .period td { border: 0; padding: 1px 0; }
        .no { width: 22px; text-align: center; }
        .equipment { width: 130px; }
        .standard { width: 140px; }
        .day { width: 19px; text-align: center; }
        .status { text-align: center; font-weight: 700; }
        .muted { color: #6b7280; }
        .signature-table { margin-top: 7px; }
        .signature-table td { height: 34px; text-align: center; }
        .notes { margin-top: 8px; page-break-inside: avoid; }
        .notes-title { font-weight: 700; margin-bottom: 4px; }
        .notes td, .notes th { padding: 4px 5px; }
        .footer { position: fixed; right: 8mm; bottom: 4mm; font-size: 8px; }
    </style>
</head>
<body>
@php
    $days = $monthlyDetail['period']['days'] ?? [];
    $noteRows = $monthlyDetail['checklist_note_rows'] ?? [];
    $statusText = static fn (?string $status): string => match ($status) {
        'OK' => 'OK',
        'NOT_OK' => 'NG',
        'NA' => 'NA',
        default => '-',
    };
    $operatorNames = collect($monthlyDetail['checklist_matrix'] ?? [])
        ->flatMap(fn ($row) => collect($row['cells'] ?? [])->flatMap(fn ($cell) => $cell['operators'] ?? []))
        ->filter()
        ->unique()
        ->values()
        ->implode(', ');
@endphp

<main class="document">
    <section class="header">
        <div class="brand">GALENIUM<br>PHARMASIA</div>
        <div class="title">
            <h1>CEKLIST PEMERIKSAAN HARIAN UNIT INSTALASI PENGOLAHAN AIR LIMBAH</h1>
        </div>
        <div>
            <table class="meta">
                <tr><td>No. Form</td><td>: FM.HSE.070.02</td></tr>
                <tr><td>Tgl. Berlaku</td><td>: 25 APR 2018</td></tr>
                <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
            </table>
        </div>
    </section>

    <section class="content">
        <table class="period">
            <tr>
                <td style="width: 70px;">Bulan</td>
                <td>: {{ $monthlyDetail['period']['label'] }}</td>
                <td style="width: 90px;">Rentang Data</td>
                <td>: {{ $monthlyDetail['period']['date_from'] }} s/d {{ $monthlyDetail['period']['date_to'] }}</td>
            </tr>
        </table>

        <table>
            <thead>
                <tr>
                    <th class="no">No</th>
                    <th class="equipment">Perlengkapan</th>
                    @foreach ($days as $day)
                        <th class="day">{{ $day['day'] }}</th>
                    @endforeach
                    <th class="standard">Kondisi Standar</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($monthlyDetail['checklist_matrix'] as $rowIndex => $row)
                    <tr>
                        <td class="no">{{ $rowIndex + 1 }}</td>
                        <td class="equipment">{{ $row['name'] }}</td>
                        @foreach ($row['cells'] as $cell)
                            <td class="status">{{ $statusText($cell['status'] ?? null) }}</td>
                        @endforeach
                        <td class="standard">{{ $row['standard_condition'] ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ count($days) + 3 }}" class="status muted">Belum ada data checklist pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <table class="signature-table">
            <tr>
                <td style="width: 33%;">Paraf Operator<br><strong>{{ $operatorNames !== '' ? $operatorNames : '-' }}</strong></td>
                <td style="width: 33%;">Paraf Supervisor<br><strong>{{ $monthlyDetail['approval']['approved_by']['name'] ?? '-' }}</strong></td>
                <td>Mengetahui,<br>HSE Department Head<br><strong>{{ $monthlyDetail['approval']['approved_by']['name'] ?? '-' }}</strong><br><span class="muted">{{ $monthlyDetail['approval']['approved_at'] ?? 'Belum approved' }}</span></td>
            </tr>
        </table>

        <section class="notes">
            <div class="notes-title">Catatan :</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 80px;">Tanggal</th>
                        <th style="width: 170px;">Nama Proses / Unit</th>
                        <th style="width: 130px;">Operator</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($noteRows as $noteRow)
                        <tr>
                            <td>{{ $noteRow['date'] }}</td>
                            <td>{{ $noteRow['item_name'] }}</td>
                            <td>{{ $noteRow['operator'] ?? '-' }}</td>
                            <td>{{ $noteRow['note'] }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="status muted">Tidak ada catatan pada periode ini.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </section>
    </section>
</main>

<div class="footer">FM.HSE.070.02 / Tanggal Berlaku : 25 APR 2018</div>
</body>
</html>
