<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Penyimpanan Limbah B3 - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { margin: 24px; }
        body { color: #111827; font-family: Arial, sans-serif; font-size: 10px; }
        h1 { font-size: 18px; margin: 0 0 4px; text-transform: uppercase; }
        h2 { font-size: 13px; margin: 18px 0 8px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #cbd5e1; padding: 5px; vertical-align: top; }
        th { background: #e5e7eb; font-weight: 700; text-align: center; }
        .header { margin-bottom: 14px; }
        .meta { margin-top: 8px; width: 55%; }
        .meta td { border: 0; padding: 2px 0; }
        .summary { margin: 12px 0; }
        .summary td { border-color: #e5e7eb; }
        .right { text-align: right; }
        .center { text-align: center; }
        .muted { color: #6b7280; }
        .total-row td { background: #f3f4f6; font-weight: 700; }
        .signature { margin-top: 18px; page-break-inside: avoid; }
        .signature td { height: 72px; text-align: center; vertical-align: bottom; width: 33.333%; }
        .small { font-size: 9px; }
    </style>
</head>
<body>
@php
    $period = $monthlyDetail['period'];
    $formatWeight = static fn ($value): string => number_format((float) $value, 2, ',', '.');
@endphp

<section class="header">
    <h1>Laporan Penyimpanan Limbah B3</h1>
    <div class="muted">Rekap data penyimpanan limbah B3 berdasarkan periode dan rentang tanggal terpilih.</div>
    <table class="meta">
        <tr><td>Periode</td><td>: {{ $period['label'] }}</td></tr>
        <tr><td>Rentang Data</td><td>: {{ $period['date_from'] }} s/d {{ $period['date_to'] }}</td></tr>
        <tr><td>Status Approval</td><td>: {{ $monthlyDetail['approval']['status_label'] }}</td></tr>
    </table>
</section>

<table class="summary">
    <tr>
        <td>Total Log: <strong>{{ $monthlyDetail['summary']['total_logs_count'] }}</strong></td>
        <td>Masuk: <strong>{{ $monthlyDetail['summary']['incoming_logs_count'] }}</strong></td>
        <td>Keluar: <strong>{{ $monthlyDetail['summary']['outgoing_logs_count'] }}</strong></td>
        <td>Total Berat: <strong>{{ $formatWeight($monthlyDetail['summary']['total_weight_kg']) }} kg</strong></td>
    </tr>
</table>

<h2>Detail Penyimpanan</h2>
<table>
    <thead>
        <tr>
            <th>No / No. Dokumen</th>
            <th>Tipe</th>
            <th>Tanggal &amp; Waktu</th>
            <th>Jenis Limbah</th>
            <th>Berat (Kg)</th>
            <th>Dept. Inisiator</th>
            <th>Operator TPS LB3</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($monthlyDetail['rows'] as $row)
            <tr>
                <td>
                    #{{ $row['no'] }}<br>
                    <strong>{{ $row['document_number'] }}</strong>
                </td>
                <td class="center">{{ $row['movement_type'] ?? ($row['tanggal_masuk'] ? 'MASUK' : 'KELUAR') }}</td>
                <td>
                    {{ $row['movement_date'] ?? $row['tanggal_masuk'] ?? $row['tanggal_keluar'] ?? '-' }}<br>
                    <span class="muted">{{ $row['jam'] ?? '-' }}</span>
                </td>
                <td>{{ $row['waste_type_name'] ?? $row['waste_type_other'] ?? '-' }}</td>
                <td class="right">{{ $formatWeight($row['weight_kg'] ?? 0) }}</td>
                <td>
                    {{ $row['initiator_department'] ?? '-' }}
                    @if ($row['initiator_user_name'] ?? null)
                        <br><span class="muted">({{ $row['initiator_user_name'] }})</span>
                    @endif
                </td>
                <td>{{ $row['operator_name'] ?? '-' }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="7" class="center muted">
                    Tidak ada log B3 pada rentang data ini.
                </td>
            </tr>
        @endforelse
    </tbody>
</table>

@php
    $rowsWithNotes = collect($monthlyDetail['rows'])->filter(fn ($row): bool => filled($row['note'] ?? null));
@endphp

@if ($rowsWithNotes->isNotEmpty())
    <h2>Catatan</h2>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>No. Dokumen</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rowsWithNotes as $row)
                <tr>
                    <td>{{ $row['movement_date'] ?? '-' }}</td>
                    <td>{{ $row['document_number'] }}</td>
                    <td>{{ $row['note'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endif

<table class="signature">
    <tr>
        <td>
            Operator TPS LB3<br>
            <strong>{{ $monthlyDetail['rows'][0]['operator_name'] ?? '-' }}</strong>
        </td>
        <td>
            Environment SPV<br>
            <strong>{{ $monthlyDetail['approval']['environment_supervisor']['name'] ?? '-' }}</strong><br>
            <span class="small muted">{{ $monthlyDetail['approval']['environment_supervisor']['signed_at'] ?? 'Belum approve' }}</span>
        </td>
        <td>
            HSE Dept Head<br>
            <strong>{{ $monthlyDetail['approval']['hse_department_head']['name'] ?? '-' }}</strong><br>
            <span class="small muted">{{ $monthlyDetail['approval']['hse_department_head']['signed_at'] ?? 'Belum approve' }}</span>
        </td>
    </tr>
</table>
</body>
</html>
