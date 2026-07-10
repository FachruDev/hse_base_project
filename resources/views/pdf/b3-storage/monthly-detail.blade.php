<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>FM038 Penyimpanan Limbah B3 - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 8px; line-height: 1.22; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #111827; padding: 3px 4px; vertical-align: middle; }
        th { text-align: center; font-weight: 700; }
        .document { border: 1px solid #111827; min-height: 190mm; }
        .header { display: grid; grid-template-columns: 120px 1fr 180px; border-bottom: 1px solid #111827; }
        .header > div { padding: 7px 8px; border-right: 1px solid #111827; min-height: 54px; }
        .header > div:last-child { border-right: 0; }
        .brand { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; text-align: center; }
        .title { text-align: center; }
        .title h1 { margin: 7px 0 0; font-size: 15px; text-transform: uppercase; }
        .meta td { border: 0; padding: 1px 0; }
        .content { padding: 8px; }
        .period { margin-bottom: 6px; }
        .period td { border: 0; padding: 1px 0; }
        .no { width: 24px; }
        .date { width: 66px; }
        .weight { width: 64px; }
        .doc-no { width: 85px; }
        .dept { width: 92px; }
        .signature-col { width: 92px; }
        .approval-col { width: 92px; }
        .center { text-align: center; }
        .right { text-align: right; }
        .muted { color: #6b7280; }
        .total td { font-weight: 700; }
        .signature { margin-top: 8px; page-break-inside: avoid; }
        .signature td { height: 50px; text-align: center; vertical-align: bottom; }
        .footer { position: fixed; right: 8mm; bottom: 4mm; font-size: 8px; }
    </style>
</head>
<body>
@php
    $wasteTypes = $monthlyDetail['columns']['waste_types'] ?? [];
    $hasOtherColumn = ($monthlyDetail['columns']['has_other_column'] ?? false) === true;
    $columnCount = 6 + count($wasteTypes) + ($hasOtherColumn ? 1 : 0) + 2;
@endphp

<main class="document">
    <section class="header">
        <div class="brand">GALENIUM<br>PHARMASIA</div>
        <div class="title"><h1>PENYIMPANAN LIMBAH B3</h1></div>
        <div>
            <table class="meta">
                <tr><td>No. Form</td><td>: FM.HSE.038.02</td></tr>
                <tr><td>Tgl. Berlaku</td><td>: 23 April 2018</td></tr>
                <tr><td>Bulan</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
            </table>
        </div>
    </section>

    <section class="content">
        <table class="period">
            <tr>
                <td style="width: 55px;">Bulan</td>
                <td>: {{ $monthlyDetail['period']['label'] }}</td>
                <td style="width: 85px;">Rentang Data</td>
                <td>: {{ $monthlyDetail['period']['date_from'] }} s/d {{ $monthlyDetail['period']['date_to'] }}</td>
            </tr>
        </table>

        <table>
            <thead>
                <tr>
                    <th rowspan="2" class="no">No</th>
                    <th rowspan="2" class="date">Tanggal</th>
                    <th colspan="{{ count($wasteTypes) + ($hasOtherColumn ? 1 : 0) }}">Berat Limbah (Kg)</th>
                    <th rowspan="2" class="doc-no">No Dokumen</th>
                    <th rowspan="2" class="dept">Dept Inisiator</th>
                    <th rowspan="2" class="signature-col">Paraf Petugas Dept Inisiator</th>
                    <th rowspan="2" class="signature-col">Paraf Operator TPS LB3</th>
                    <th rowspan="2" class="approval-col">Approval Environment SPV</th>
                    <th rowspan="2" class="approval-col">Approval HSE Dept Head</th>
                </tr>
                <tr>
                    @foreach ($wasteTypes as $wasteType)
                        <th class="weight">{{ $wasteType['name'] ?? '-' }}</th>
                    @endforeach
                    @if ($hasOtherColumn)
                        <th class="weight">Lain-lain</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                @forelse ($monthlyDetail['rows'] as $row)
                    <tr>
                        <td class="center">{{ $row['no'] }}</td>
                        <td class="center">{{ $row['movement_date'] ?? '-' }}</td>
                        @foreach ($wasteTypes as $wasteType)
                            @php $wasteTypeId = $wasteType['id'] ?? null; @endphp
                            <td class="right">{{ \App\Support\Reports\FmReportFormatter::decimal($row['weights_by_waste_type'][$wasteTypeId] ?? null) }}</td>
                        @endforeach
                        @if ($hasOtherColumn)
                            <td class="right">{{ \App\Support\Reports\FmReportFormatter::decimal($row['weight_other'] ?? null) }}</td>
                        @endif
                        <td>{{ $row['document_number'] ?? '-' }}</td>
                        <td>{{ $row['initiator_department'] ?? '-' }}</td>
                        <td>{{ $row['initiator_user_name'] ?? '-' }}</td>
                        <td>{{ $row['operator_name'] ?? '-' }}</td>
                        <td>{{ $monthlyDetail['approval']['environment_supervisor']['name'] ?? '-' }}</td>
                        <td>{{ $monthlyDetail['approval']['hse_department_head']['name'] ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ $columnCount }}" class="center muted">Tidak ada log B3 pada rentang data ini.</td>
                    </tr>
                @endforelse
                <tr class="total">
                    <td colspan="2" class="center">TOTAL</td>
                    @foreach ($wasteTypes as $wasteType)
                        @php $wasteTypeId = $wasteType['id'] ?? null; @endphp
                        <td class="right">{{ \App\Support\Reports\FmReportFormatter::decimal($monthlyDetail['totals']['by_waste_type'][$wasteTypeId] ?? 0) }}</td>
                    @endforeach
                    @if ($hasOtherColumn)
                        <td class="right">{{ \App\Support\Reports\FmReportFormatter::decimal($monthlyDetail['totals']['other'] ?? 0) }}</td>
                    @endif
                    <td colspan="6">Total Keseluruhan: {{ \App\Support\Reports\FmReportFormatter::weightKg($monthlyDetail['totals']['overall'] ?? 0) }}</td>
                </tr>
            </tbody>
        </table>

        <table class="signature">
            <tr>
                <td>Environment SPV<br><strong>{{ $monthlyDetail['approval']['environment_supervisor']['name'] ?? '-' }}</strong><br><span class="muted">{{ $monthlyDetail['approval']['environment_supervisor']['signed_at'] ?? 'Belum approve' }}</span></td>
                <td>HSE Dept Head<br><strong>{{ $monthlyDetail['approval']['hse_department_head']['name'] ?? '-' }}</strong><br><span class="muted">{{ $monthlyDetail['approval']['hse_department_head']['signed_at'] ?? 'Belum approve' }}</span></td>
            </tr>
        </table>
    </section>
</main>

<div class="footer">FM.HSE.038.02 / Tgl. Berlaku : 23 April 2018</div>
</body>
</html>
