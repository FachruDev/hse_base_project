<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Detail Penyimpanan Limbah B3 - {{ $log['document_number'] }}</title>
    <style>
        @page { margin: 28px; }
        body { color: #111827; font-family: Arial, sans-serif; font-size: 11px; }
        h1 { font-size: 18px; margin: 0 0 4px; text-transform: uppercase; }
        table { border-collapse: collapse; margin-top: 14px; width: 100%; }
        th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; vertical-align: top; }
        th { background: #e5e7eb; width: 30%; }
        .muted { color: #6b7280; }
        .signature { margin-top: 28px; page-break-inside: avoid; }
        .signature td { height: 76px; text-align: center; vertical-align: bottom; width: 50%; }
    </style>
</head>
<body>
@php
    $formatWeight = static fn ($value): string => number_format((float) $value, 2, ',', '.');
@endphp

<h1>Detail Form Penyimpanan Limbah B3</h1>
<div class="muted">Dokumen ini dibuat dari data log penyimpanan limbah B3 yang dipilih.</div>

<table>
    <tr>
        <th>Tipe Pergerakan</th>
        <td>{{ $log['movement_type'] }}</td>
    </tr>
    <tr>
        <th>Tanggal dan Jam</th>
        <td>{{ $log['movement_date'] ?? '-' }} {{ $log['movement_time'] ? ' '.$log['movement_time'] : '' }}</td>
    </tr>
    <tr>
        <th>Jenis Limbah</th>
        <td>{{ $log['waste_type_name'] }}</td>
    </tr>
    <tr>
        <th>Berat (Kg)</th>
        <td>{{ $formatWeight($log['weight_kg']) }} kg</td>
    </tr>
    <tr>
        <th>No. Dokumen</th>
        <td>{{ $log['document_number'] }}</td>
    </tr>
    <tr>
        <th>Dept. Inisiator</th>
        <td>{{ $log['initiator_department'] ?? '-' }}</td>
    </tr>
    <tr>
        <th>Petugas Dept. Inisiator</th>
        <td>{{ $log['initiator_user_name'] ?? '-' }}</td>
    </tr>
    <tr>
        <th>Operator TPS LB3</th>
        <td>{{ $log['operator_name'] ?? '-' }}{{ $log['operator_external_id'] ? ' ('.$log['operator_external_id'].')' : '' }}</td>
    </tr>
    <tr>
        <th>Catatan</th>
        <td>{{ $log['note'] ?? '-' }}</td>
    </tr>
    <tr>
        <th>Dibuat Pada</th>
        <td>{{ $log['created_at'] ?? '-' }}</td>
    </tr>
</table>

<table class="signature">
    <tr>
        <td>
            Petugas Dept. Inisiator<br>
            <strong>{{ $log['initiator_user_name'] ?? '-' }}</strong>
        </td>
        <td>
            Operator TPS LB3<br>
            <strong>{{ $log['operator_name'] ?? '-' }}</strong>
        </td>
    </tr>
</table>
</body>
</html>
