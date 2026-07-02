<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Catatan Harian IPAL - {{ $entryForm['entry']['tanggal'] }}</title>
    <style>
        @page { margin: 28px; }
        body { color: #111827; font-family: Arial, sans-serif; font-size: 10px; }
        h1 { font-size: 18px; margin: 0 0 4px; text-transform: uppercase; }
        h2 { font-size: 13px; margin: 18px 0 8px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #e5e7eb; font-weight: 700; text-align: center; }
        .meta { margin-top: 10px; width: 60%; }
        .meta td { border: 0; padding: 2px 0; }
        .muted { color: #6b7280; }
        .center { text-align: center; }
        .section { background: #f3f4f6; font-weight: 700; }
        .signature { margin-top: 24px; page-break-inside: avoid; }
        .signature td { height: 70px; text-align: center; vertical-align: bottom; width: 50%; }
    </style>
</head>
<body>
@php
    $formatValue = static function (array $item): string {
        if (isset($item['value_number']) && $item['value_number'] !== null && $item['value_number'] !== '') {
            return (string) $item['value_number'];
        }

        if (isset($item['value_text']) && trim((string) $item['value_text']) !== '') {
            return (string) $item['value_text'];
        }

        return '-';
    };
@endphp

<h1>Catatan Harian IPAL</h1>
<div class="muted">Dokumen ini dibuat dari data checklist, catatan proses, dan batch mixing harian IPAL.</div>

<table class="meta">
    <tr><td>Tanggal</td><td>: {{ $entryForm['entry']['tanggal'] }}</td></tr>
    <tr><td>Operator</td><td>: {{ $entryForm['entry']['operator']['name'] }} ({{ $entryForm['entry']['operator']['external_id'] }})</td></tr>
    <tr><td>Departemen</td><td>: {{ $entryForm['entry']['operator']['department_name'] ?? '-' }}</td></tr>
    <tr><td>Status</td><td>: {{ $entryForm['entry']['status'] ?? 'DRAFT' }}</td></tr>
</table>

<h2>Checklist Harian</h2>
<table>
    <thead>
        <tr>
            <th style="width: 4%;">No</th>
            <th>Item</th>
            <th style="width: 18%;">Standar</th>
            <th style="width: 16%;">Status</th>
            <th style="width: 26%;">Catatan</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($entryForm['checklist']['items'] as $index => $item)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $item['name'] }}</td>
                <td>{{ $item['standard_condition'] ?? '-' }}</td>
                <td class="center">{{ $item['status'] ?? '-' }}</td>
                <td>{{ $item['note'] ?? '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="5" class="center muted">Tidak ada data checklist.</td></tr>
        @endforelse
    </tbody>
</table>

<h2>Catatan Proses</h2>
<table>
    <thead>
        <tr>
            <th style="width: 4%;">No</th>
            <th>Proses</th>
            <th style="width: 22%;">Standar</th>
            <th style="width: 18%;">Kondisi Aktual</th>
            <th style="width: 24%;">Catatan</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($entryForm['process']['sections'] as $section)
            <tr>
                <td colspan="5" class="section">{{ $section['name'] }}</td>
            </tr>
            @foreach ($section['items'] as $index => $item)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $item['name'] }}</td>
                    <td>{{ $item['standard_condition'] ?? '-' }}</td>
                    <td>{{ $formatValue($item) }}</td>
                    <td>{{ $item['note'] ?? '-' }}</td>
                </tr>
            @endforeach
        @empty
            <tr><td colspan="5" class="center muted">Tidak ada data catatan proses.</td></tr>
        @endforelse
    </tbody>
</table>

@if (! empty($entryForm['batch']['groups']))
    <h2>Batch Mixing</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 12%;">Batch</th>
                @foreach ($entryForm['batch']['sections'] as $section)
                    @foreach ($section['items'] as $item)
                        <th>{{ $section['name'] }} - {{ $item['name'] }}</th>
                    @endforeach
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach ($entryForm['batch']['groups'] as $batch)
                <tr>
                    <td class="center">Batch {{ $batch['batch_no'] }}</td>
                    @foreach ($batch['values'] as $value)
                        <td>{{ $formatValue($value) }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
@endif

<table class="signature">
    <tr>
        <td>
            Operator IPAL<br>
            <strong>{{ $entryForm['entry']['operator']['name'] }}</strong>
        </td>
        <td>
            Status Dokumen<br>
            <strong>{{ $entryForm['entry']['status'] ?? 'DRAFT' }}</strong>
        </td>
    </tr>
</table>
</body>
</html>
