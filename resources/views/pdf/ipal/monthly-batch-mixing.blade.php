<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Batch Mixing IPAL - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #172033; font-family: Arial, sans-serif; font-size: 9.5px; line-height: 1.35; }
        .document { border: 1.4px solid #172033; min-height: 190mm; }
        .masthead { display: grid; grid-template-columns: 160px 1fr 210px; border-bottom: 1.4px solid #172033; }
        .brand, .doc-title, .doc-meta { padding: 10px 12px; }
        .brand { border-right: 1.4px solid #172033; font-weight: 700; font-size: 15px; letter-spacing: .5px; }
        .doc-title { text-align: center; border-right: 1.4px solid #172033; }
        .doc-title h1 { margin: 0; font-size: 17px; letter-spacing: .4px; text-transform: uppercase; }
        .doc-title p { margin: 4px 0 0; color: #475569; font-size: 10px; }
        .doc-meta table { width: 100%; border-collapse: collapse; }
        .doc-meta td { padding: 1px 0; border: 0; }
        .doc-meta td:first-child { width: 78px; color: #64748b; }
        .content { padding: 10px 12px 12px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #cbd5e1; margin-bottom: 10px; }
        .summary > div { padding: 7px 8px; border-right: 1px solid #cbd5e1; }
        .summary > div:last-child { border-right: 0; }
        .label { color: #64748b; font-size: 8.5px; text-transform: uppercase; letter-spacing: .3px; }
        .value { display: block; margin-top: 2px; font-weight: 700; font-size: 12px; color: #172033; }
        .day-block { border: 1px solid #cbd5e1; margin-bottom: 9px; page-break-inside: avoid; }
        .day-head { display: grid; grid-template-columns: 150px 1fr 90px; background: #e8eef7; border-bottom: 1px solid #cbd5e1; }
        .day-head div { padding: 6px 8px; border-right: 1px solid #cbd5e1; }
        .day-head div:last-child { border-right: 0; text-align: center; }
        .batch-row { padding: 8px; border-top: 1px solid #e2e8f0; }
        .batch-row:first-of-type { border-top: 0; }
        .batch-title { margin: 0 0 6px; font-size: 11.5px; text-transform: uppercase; }
        .section-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; align-items: start; }
        .section { border: 1px solid #cbd5e1; page-break-inside: avoid; }
        .section h3 { margin: 0; padding: 5px 6px; background: #f8fafc; border-bottom: 1px solid #cbd5e1; font-size: 10px; }
        .section table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .section td { border-bottom: 1px solid #e2e8f0; padding: 4px 6px; vertical-align: top; }
        .section tr:last-child td { border-bottom: 0; }
        .section td:first-child { width: 58%; color: #475569; }
        .section td:last-child { font-weight: 700; }
        .empty { border: 1px solid #cbd5e1; padding: 18px; text-align: center; color: #64748b; }
        .approval { display: grid; grid-template-columns: 1fr 280px; gap: 12px; margin-top: 12px; }
        .approval > div { border: 1px solid #cbd5e1; padding: 8px; min-height: 58px; }
    </style>
</head>
<body>
    <main class="document">
        <section class="masthead">
            <div class="brand">HSE</div>
            <div class="doc-title">
                <h1>Form Catatan Batch Mixing IPAL</h1>
                <p>Dokumen rekap bulanan - bukan tampilan form aplikasi</p>
            </div>
            <div class="doc-meta">
                <table>
                    <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
                    <tr><td>Tanggal</td><td>: {{ now()->format('Y-m-d H:i') }}</td></tr>
                    <tr><td>Total</td><td>: {{ $monthlyDetail['summary']['batch_mixing_logs_count'] }} log batch</td></tr>
                </table>
            </div>
        </section>

        <section class="content">
            <div class="summary">
                <div><span class="label">Nama dokumen</span><span class="value">Rekap Batch Mixing</span></div>
                <div><span class="label">Periode</span><span class="value">{{ $monthlyDetail['period']['label'] }}</span></div>
                <div><span class="label">Hari ada batch</span><span class="value">{{ count($monthlyDetail['batch_rows'] ?? []) }} hari</span></div>
                <div><span class="label">Approval checklist</span><span class="value">{{ $monthlyDetail['approval']['status'] === 'APPROVED' ? 'Approved' : 'Pending' }}</span></div>
            </div>

            @forelse (($monthlyDetail['batch_rows'] ?? []) as $row)
                <article class="day-block">
                    <div class="day-head">
                        <div><strong>{{ $row['tanggal'] ?? '-' }}</strong></div>
                        <div>Operator: <strong>{{ $row['operator']['name'] ?? '-' }}</strong> - {{ $row['operator']['department_name'] ?? '-' }}</div>
                        <div>{{ count($row['batches']) }} batch</div>
                    </div>

                    @foreach ($row['batches'] as $batch)
                        <div class="batch-row">
                            <h2 class="batch-title">Batch {{ $batch['batch_no'] }}</h2>
                            <div class="section-grid">
                                @foreach ($batch['sections'] as $section)
                                    <section class="section">
                                        <h3>{{ $section['name'] }}</h3>
                                        <table>
                                            <tbody>
                                                @foreach ($section['values'] as $value)
                                                    <tr>
                                                        <td>{{ $value['name'] ?? '-' }}</td>
                                                        <td>
                                                            @if ($value['value_number'] !== null)
                                                                {{ rtrim(rtrim(number_format((float) $value['value_number'], 2, ',', '.'), '0'), ',') }}
                                                            @elseif ($value['value_text'] !== null && $value['value_text'] !== '')
                                                                {{ $value['value_text'] }}
                                                            @else
                                                                -
                                                            @endif
                                                        </td>
                                                    </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </section>
                                @endforeach
                            </div>
                        </div>
                    @endforeach
                </article>
            @empty
                <div class="empty">Belum ada data batch mixing pada periode ini.</div>
            @endforelse

            <div class="approval">
                <div>
                    <span class="label">Catatan</span>
                    <p>Dokumen ini dibuat dari data batch mixing IPAL pada periode {{ $monthlyDetail['period']['label'] }}.</p>
                </div>
                <div>
                    <span class="label">Diperiksa oleh</span>
                    <p><strong>{{ $monthlyDetail['approval']['approved_by']['name'] ?? '-' }}</strong></p>
                    <p>{{ $monthlyDetail['approval']['approved_at'] ?? 'Belum approved' }}</p>
                </div>
            </div>
        </section>
    </main>
</body>
</html>
