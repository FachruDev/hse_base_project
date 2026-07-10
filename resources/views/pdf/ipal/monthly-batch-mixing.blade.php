<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>FM071 Catatan Proses IPAL - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.25; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #111827; padding: 3px 4px; vertical-align: middle; }
        th { text-align: center; font-weight: 700; }
        .page { border: 1px solid #111827; min-height: 190mm; page-break-after: always; }
        .page:last-child { page-break-after: auto; }
        .header { display: grid; grid-template-columns: 120px 1fr 180px; border-bottom: 1px solid #111827; }
        .header > div { padding: 7px 8px; border-right: 1px solid #111827; min-height: 54px; }
        .header > div:last-child { border-right: 0; }
        .brand { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; text-align: center; }
        .title { text-align: center; }
        .title h1 { margin: 7px 0 0; font-size: 14px; text-transform: uppercase; }
        .meta td { border: 0; padding: 1px 0; }
        .content { padding: 8px; }
        .identity { margin-bottom: 6px; }
        .identity td { border: 0; padding: 1px 0; }
        .unit { width: 130px; }
        .process { width: 180px; }
        .standard { width: 185px; }
        .condition { width: 135px; }
        .note { width: 160px; }
        .section-title { margin: 8px 0 4px; font-weight: 700; text-transform: uppercase; }
        .batch-head { width: 58px; }
        .signature { margin-top: 8px; page-break-inside: avoid; }
        .signature td { height: 44px; text-align: center; vertical-align: bottom; }
        .center { text-align: center; }
        .muted { color: #6b7280; }
        .footer { position: fixed; right: 8mm; bottom: 4mm; font-size: 8px; }
    </style>
</head>
<body>
@php
    $processRows = $monthlyDetail['process_detail_rows'] ?? [];
    $batchRows = collect($monthlyDetail['batch_rows'] ?? [])->keyBy('tanggal');
@endphp

@forelse ($processRows as $processRow)
    @php
        $batchRow = $batchRows->get($processRow['tanggal'] ?? '');
    @endphp
    <main class="page">
        <section class="header">
            <div class="brand">GALENIUM<br>PHARMASIA</div>
            <div class="title">
                <h1>CATATAN PROSES PENGOLAHAN AIR LIMBAH</h1>
            </div>
            <div>
                <table class="meta">
                    <tr><td>No. Form</td><td>: FM.HSE.071.02</td></tr>
                    <tr><td>Tgl. Berlaku</td><td>: 25 APR 2018</td></tr>
                    <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
                </table>
            </div>
        </section>

        <section class="content">
            <table class="identity">
                <tr>
                    <td style="width: 90px;">Hari / Tanggal</td>
                    <td>: {{ $processRow['tanggal'] ?? '-' }}</td>
                    <td style="width: 80px;">Operator</td>
                    <td>: {{ $processRow['operator']['name'] ?? '-' }}</td>
                </tr>
            </table>

            <table>
                <thead>
                    <tr>
                        <th class="unit">UNIT PROSES</th>
                        <th class="process">URAIAN PROSES</th>
                        <th class="standard">KONDISI STANDAR</th>
                        <th class="condition">KONDISI</th>
                        <th class="note">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse (($processRow['sections'] ?? []) as $section)
                        @foreach (($section['items'] ?? []) as $item)
                            <tr>
                                <td>{{ $section['name'] ?? '-' }}</td>
                                <td>{{ $item['name'] ?? '-' }}</td>
                                <td>{{ $item['standard_condition'] ?? '-' }}</td>
                                <td>{{ $item['display_value'] ?? '-' }}</td>
                                <td>{{ $item['note'] ?? '-' }}</td>
                            </tr>
                        @endforeach
                    @empty
                        <tr><td colspan="5" class="center muted">Tidak ada catatan proses pada tanggal ini.</td></tr>
                    @endforelse
                </tbody>
            </table>

        </section>
    </main>

    <main class="page">
        <section class="header">
            <div class="brand">GALENIUM<br>PHARMASIA</div>
            <div class="title">
                <h1>CATATAN PROSES PENGOLAHAN AIR LIMBAH</h1>
            </div>
            <div>
                <table class="meta">
                    <tr><td>No. Form</td><td>: FM.HSE.071.02</td></tr>
                    <tr><td>Tgl. Berlaku</td><td>: 25 APR 2018</td></tr>
                    <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
                </table>
            </div>
        </section>

        <section class="content">
            <table class="identity">
                <tr>
                    <td style="width: 90px;">Hari / Tanggal</td>
                    <td>: {{ $processRow['tanggal'] ?? '-' }}</td>
                    <td style="width: 80px;">Operator</td>
                    <td>: {{ $processRow['operator']['name'] ?? '-' }}</td>
                </tr>
            </table>

            <div class="section-title">CATATAN PROSES MIXING</div>
            <table>
                <thead>
                    <tr>
                        <th class="unit">UNIT PROSES</th>
                        <th class="process">URAIAN PROSES</th>
                        @for ($batchNo = 1; $batchNo <= 9; $batchNo++)
                            <th class="batch-head">Batch {{ $batchNo }}</th>
                        @endfor
                    </tr>
                </thead>
                <tbody>
                    @forelse (($batchRow['mixing_rows'] ?? []) as $mixingRow)
                        <tr>
                            <td>{{ $mixingRow['section_name'] ?? '-' }}</td>
                            <td>{{ $mixingRow['item_name'] ?? '-' }}</td>
                            @foreach (($mixingRow['batch_values'] ?? []) as $value)
                                <td class="center">{{ $value }}</td>
                            @endforeach
                        </tr>
                    @empty
                        <tr><td colspan="11" class="center muted">Tidak ada batch mixing pada tanggal ini.</td></tr>
                    @endforelse
                </tbody>
            </table>

            <table class="signature">
                <tr>
                    <td>Dibuat Oleh,<br>WWTP Operator<br><strong>{{ $processRow['operator']['name'] ?? '-' }}</strong></td>
                    <td>Diperiksa Oleh,<br>Environment SPV<br><strong>{{ $processRow['checked_by'] ?? '-' }}</strong><br><span class="muted">{{ $processRow['checked_at'] ?? 'Belum diperiksa' }}</span></td>
                </tr>
            </table>
        </section>
    </main>
@empty
    <main class="page">
        <section class="header">
            <div class="brand">GALENIUM<br>PHARMASIA</div>
            <div class="title"><h1>CATATAN PROSES PENGOLAHAN AIR LIMBAH</h1></div>
            <div>
                <table class="meta">
                    <tr><td>No. Form</td><td>: FM.HSE.071.02</td></tr>
                    <tr><td>Tgl. Berlaku</td><td>: 25 APR 2018</td></tr>
                    <tr><td>Periode</td><td>: {{ $monthlyDetail['period']['label'] }}</td></tr>
                </table>
            </div>
        </section>
        <section class="content center muted">Tidak ada catatan proses pada periode ini.</section>
    </main>
@endforelse

<div class="footer">FM.HSE.071.02/Tgl. berlaku: 25 APR 2018</div>
</body>
</html>
