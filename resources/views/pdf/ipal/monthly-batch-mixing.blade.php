<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Batch Mixing IPAL - {{ $monthlyDetail['period']['label'] }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 10px; }
        header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 12px; }
        h1 { margin: 0 0 4px; font-size: 18px; letter-spacing: .2px; }
        h2 { margin: 0; font-size: 13px; }
        h3 { margin: 8px 0 5px; font-size: 11px; color: #374151; }
        .muted { color: #6b7280; }
        .meta { text-align: right; line-height: 1.5; }
        .day { border: 1px solid #cbd5e1; margin-bottom: 10px; page-break-inside: avoid; }
        .day-head { display: flex; justify-content: space-between; gap: 12px; background: #eef2f7; border-bottom: 1px solid #cbd5e1; padding: 7px 9px; }
        .batch { padding: 8px 9px; border-top: 1px solid #e5e7eb; }
        .batch:first-child { border-top: 0; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 7px; }
        th, td { border: 1px solid #d1d5db; padding: 4px 5px; vertical-align: top; }
        th { background: #f8fafc; text-align: left; font-weight: 700; }
        .label { width: 220px; }
        .empty { border: 1px solid #cbd5e1; padding: 14px; text-align: center; color: #6b7280; }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>Form Catatan Batch Mixing IPAL</h1>
            <div class="muted">Periode {{ $monthlyDetail['period']['label'] }}</div>
        </div>
        <div class="meta">
            <div>Dicetak: {{ now()->format('Y-m-d H:i') }}</div>
            <div>Total log batch: {{ $monthlyDetail['summary']['batch_mixing_logs_count'] }}</div>
        </div>
    </header>

    @forelse (($monthlyDetail['batch_rows'] ?? []) as $row)
        <section class="day">
            <div class="day-head">
                <div>
                    <h2>{{ $row['tanggal'] ?? '-' }}</h2>
                    <div class="muted">{{ $row['operator']['name'] ?? '-' }} · {{ $row['operator']['department_name'] ?? '-' }}</div>
                </div>
                <div class="muted">{{ count($row['batches']) }} batch</div>
            </div>

            @foreach ($row['batches'] as $batch)
                <div class="batch">
                    <h2>Batch {{ $batch['batch_no'] }}</h2>
                    @foreach ($batch['sections'] as $section)
                        <h3>{{ $section['name'] }}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th class="label">Uraian</th>
                                    <th>Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($section['values'] as $value)
                                    <tr>
                                        <td class="label">{{ $value['name'] ?? '-' }}</td>
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
                    @endforeach
                </div>
            @endforeach
        </section>
    @empty
        <div class="empty">Belum ada data batch mixing pada periode ini.</div>
    @endforelse
</body>
</html>
