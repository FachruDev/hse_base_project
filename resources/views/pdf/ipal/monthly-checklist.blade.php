<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Checklist Harian IPAL - {{ $monthlyDetail['period']['label'] }}</title>
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
        .summary { display: grid; grid-template-columns: 1.1fr repeat(4, .72fr); gap: 0; margin-bottom: 10px; border: 1px solid #cbd5e1; }
        .summary > div { padding: 7px 8px; border-right: 1px solid #cbd5e1; min-height: 40px; }
        .summary > div:last-child { border-right: 0; }
        .label { color: #64748b; font-size: 8.5px; text-transform: uppercase; letter-spacing: .3px; }
        .value { display: block; margin-top: 2px; font-weight: 700; font-size: 12px; color: #172033; }
        .matrix { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .matrix th, .matrix td { border: 1px solid #cbd5e1; padding: 3px 2px; vertical-align: middle; }
        .matrix th { background: #e8eef7; font-weight: 700; }
        .matrix .item { width: 142px; text-align: left; }
        .matrix .standard { width: 150px; text-align: left; }
        .matrix .day { width: 18px; text-align: center; }
        .matrix .status { text-align: center; font-weight: 700; }
        .ok { color: #047857; }
        .not-ok { color: #b91c1c; }
        .na { color: #64748b; }
        .empty { color: #94a3b8; }
        .notes { display: grid; grid-template-columns: 1fr 280px; gap: 12px; margin-top: 12px; align-items: stretch; }
        .legend, .approval { border: 1px solid #cbd5e1; padding: 8px; }
        .legend h2, .approval h2 { margin: 0 0 6px; font-size: 10.5px; text-transform: uppercase; letter-spacing: .25px; }
        .legend p, .approval p { margin: 2px 0; }
        .signature-space { height: 30px; }
        .audit-page { page-break-before: always; border: 1.4px solid #172033; min-height: 185mm; }
        .audit-head { display: grid; grid-template-columns: 1fr 210px; border-bottom: 1.4px solid #172033; }
        .audit-title, .audit-meta { padding: 10px 12px; }
        .audit-title { border-right: 1.4px solid #172033; }
        .audit-title h2 { margin: 0; font-size: 15px; letter-spacing: .35px; text-transform: uppercase; }
        .audit-title p { margin: 4px 0 0; color: #475569; font-size: 10px; }
        .audit-meta table { width: 100%; border-collapse: collapse; }
        .audit-meta td { padding: 1px 0; border: 0; }
        .audit-meta td:first-child { width: 78px; color: #64748b; }
        .audit-content { padding: 10px 12px 12px; }
        .audit-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .audit-table th, .audit-table td { border: 1px solid #cbd5e1; padding: 6px 7px; vertical-align: top; }
        .audit-table th { background: #e8eef7; font-weight: 700; text-align: left; }
        .audit-table .date { width: 95px; }
        .audit-table .item-name { width: 180px; }
        .audit-table .operator { width: 140px; }
        .audit-table .note { white-space: normal; }
    </style>
</head>
<body>
    @php
        $checklistNoteRows = $monthlyDetail['checklist_note_rows'] ?? [];
    @endphp

    <main class="document">
        <section class="masthead">
            <div class="brand">HSE</div>
            <div class="doc-title">
                <h1>Checklist Pemeriksaan Harian IPAL</h1>
                <p>Dokumen rekap bulanan - bukan tampilan form aplikasi</p>
            </div>
            <div class="doc-meta">
                <table>
                    <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
                    <tr><td>Tanggal</td><td>: {{ now()->format('Y-m-d H:i') }}</td></tr>
                    <tr><td>Status</td><td>: {{ $monthlyDetail['approval']['status'] === 'APPROVED' ? 'Approved' : 'Belum approved' }}</td></tr>
                </table>
            </div>
        </section>

        <section class="content">
            <div class="summary">
                <div>
                    <span class="label">Nama dokumen</span>
                    <span class="value">Rekap Checklist IPAL</span>
                </div>
                <div>
                    <span class="label">Checklist</span>
                    <span class="value">{{ $monthlyDetail['summary']['checklist_days_count'] }} hari</span>
                </div>
                <div>
                    <span class="label">Proses</span>
                    <span class="value">{{ $monthlyDetail['summary']['process_logs_count'] }} log</span>
                </div>
                <div>
                    <span class="label">Batch</span>
                    <span class="value">{{ $monthlyDetail['summary']['batch_mixing_logs_count'] }} log</span>
                </div>
                <div>
                    <span class="label">Approval</span>
                    <span class="value">{{ $monthlyDetail['approval']['status'] === 'APPROVED' ? 'Approved' : 'Pending' }}</span>
                </div>
            </div>

            <table class="matrix">
                <thead>
                    <tr>
                        <th class="item">Perlengkapan / unit</th>
                        @foreach ($monthlyDetail['period']['days'] as $day)
                            <th class="day">{{ $day['day'] }}</th>
                        @endforeach
                        <th class="standard">Kondisi standar</th>
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
                                        'NOT_OK' => 'NG',
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

            <div class="notes">
                <div class="legend">
                    <h2>Keterangan</h2>
                    <p>OK: Berfungsi sesuai standar. NG: Tidak berfungsi / tidak sesuai standar. NA: Tidak berlaku.</p>
                    <p>Dokumen ini dibuat dari data checklist harian IPAL pada periode {{ $monthlyDetail['period']['label'] }}.</p>
                </div>
                <div class="approval">
                    <h2>Pemeriksaan HSE Dept Head</h2>
                    <div class="signature-space"></div>
                    <p><strong>{{ $monthlyDetail['approval']['approved_by']['name'] ?? '-' }}</strong></p>
                    <p class="label">{{ $monthlyDetail['approval']['approved_at'] ?? 'Belum approved' }}</p>
                </div>
            </div>
        </section>
    </main>

    @if (count($checklistNoteRows) > 0)
        <section class="audit-page">
            <div class="audit-head">
                <div class="audit-title">
                    <h2>Lampiran Audit Catatan Checklist</h2>
                    <p>Catatan checklist yang tercatat pada periode {{ $monthlyDetail['period']['label'] }}.</p>
                </div>
                <div class="audit-meta">
                    <table>
                        <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
                        <tr><td>Total</td><td>: {{ count($checklistNoteRows) }} catatan</td></tr>
                        <tr><td>Lampiran</td><td>: Tidak disertakan</td></tr>
                    </table>
                </div>
            </div>

            <div class="audit-content">
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th class="date">Tanggal</th>
                            <th class="item-name">Nama proses / unit</th>
                            <th class="operator">Operator</th>
                            <th class="note">Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($checklistNoteRows as $noteRow)
                            <tr>
                                <td class="date">{{ $noteRow['date'] }}</td>
                                <td class="item-name">{{ $noteRow['item_name'] }}</td>
                                <td class="operator">{{ $noteRow['operator'] ?? '-' }}</td>
                                <td class="note">{{ $noteRow['note'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </section>
    @endif
</body>
</html>
