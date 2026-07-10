<?php

namespace App\Support\Reports;

class FmReportFormatter
{
    public static function decimal(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return number_format((float) $value, 2, ',', '.');
    }

    public static function decimalWithUnit(mixed $value, ?string $unit): string
    {
        $formatted = self::decimal($value);

        if ($formatted === '-' || $unit === null || trim($unit) === '') {
            return $formatted;
        }

        return $formatted.' '.trim($unit);
    }

    public static function weightKg(mixed $value): string
    {
        return self::decimalWithUnit($value, 'Kg');
    }

    public static function chemicalLiter(mixed $value): string
    {
        return self::decimalWithUnit($value, 'Liter');
    }

    public static function displayValue(mixed $textValue, mixed $numberValue, ?string $unit = null): string
    {
        if ($numberValue !== null && $numberValue !== '') {
            return self::decimalWithUnit($numberValue, $unit);
        }

        if (is_string($textValue) && trim($textValue) !== '') {
            return trim($textValue);
        }

        return '-';
    }
}
