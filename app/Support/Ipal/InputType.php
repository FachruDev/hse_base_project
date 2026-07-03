<?php

namespace App\Support\Ipal;

class InputType
{
    public const Text = 'text';

    public const Option = 'option';

    public const OptionWithManual = 'option_with_manual';

    public const Decimal2 = 'decimal_2';

    public const Integer = 'integer';

    public const DurationMinutes = 'duration_minutes';

    /**
     * @return array<int, string>
     */
    public static function allowedForMaster(): array
    {
        return [
            self::Text,
            self::Option,
            self::OptionWithManual,
            self::Decimal2,
            self::Integer,
            self::DurationMinutes,
        ];
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function optionsForMaster(): array
    {
        return [
            ['label' => 'Text', 'value' => self::Text],
            ['label' => 'Option', 'value' => self::Option],
            ['label' => 'Option dengan Manual', 'value' => self::OptionWithManual],
            ['label' => 'Desimal 2 Digit', 'value' => self::Decimal2],
            ['label' => 'Angka Bulat', 'value' => self::Integer],
            ['label' => 'Durasi Menit', 'value' => self::DurationMinutes],
        ];
    }

    public static function canonical(?string $inputType): string
    {
        return match ($inputType) {
            'number' => self::Decimal2,
            'select', 'option_standard' => self::Option,
            self::OptionWithManual => self::OptionWithManual,
            self::Decimal2 => self::Decimal2,
            self::Integer => self::Integer,
            self::DurationMinutes => self::DurationMinutes,
            default => self::Text,
        };
    }

    public static function storesNumber(?string $inputType): bool
    {
        return in_array(self::canonical($inputType), [
            self::Decimal2,
            self::Integer,
            self::DurationMinutes,
        ], true);
    }

    public static function requiresInteger(?string $inputType): bool
    {
        return in_array(self::canonical($inputType), [
            self::Integer,
            self::DurationMinutes,
        ], true);
    }
}
