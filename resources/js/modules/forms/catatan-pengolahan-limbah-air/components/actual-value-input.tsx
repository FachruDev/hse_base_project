import { Check, Pencil, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

type ActualValueChange = {
    value_text: string;
    value_number: string;
};

type ActualValueInputProps = {
    inputType: string;
    valueText: string;
    valueNumber: string;
    readOnly: boolean;
    required?: boolean;
    onChange: (value: ActualValueChange) => void;
};

function canonicalInputType(inputType: string): string {
    switch (inputType) {
        case 'number':
            return 'decimal_2';
        case 'select':
        case 'option_standard':
            return 'option';
        case 'option':
        case 'option_with_manual':
        case 'decimal_2':
        case 'integer':
        case 'duration_minutes':
        case 'text':
            return inputType;
        default:
            return 'text';
    }
}

function roundToDecimals(value: string, decimals: number): string {
    const number = parseFloat(value);

    if (Number.isNaN(number)) {
        return value;
    }

    return number.toFixed(decimals);
}

function limitDecimalPlaces(value: string, decimals: number): string {
    if (value === '') {
        return value;
    }

    const normalized = value.replace(',', '.');
    const [wholePart, decimalPart] = normalized.split('.');

    if (decimalPart === undefined) {
        return normalized;
    }

    return `${wholePart}.${decimalPart.slice(0, decimals)}`;
}

function roundToInteger(value: string): string {
    const number = parseFloat(value);

    if (Number.isNaN(number)) {
        return value;
    }

    return String(Math.round(number));
}

export function ActualValueInput({
    inputType,
    valueText,
    valueNumber,
    readOnly,
    required = false,
    onChange,
}: ActualValueInputProps) {
    const canonicalType = canonicalInputType(inputType);

    if (canonicalType === 'decimal_2') {
        return (
            <Input
                type="number"
                step="0.01"
                className="bg-background shadow-sm transition-all"
                placeholder="Masukkan angka..."
                value={valueNumber}
                readOnly={readOnly}
                required={required}
                onBlur={(event) => {
                    const rounded = roundToDecimals(event.target.value, 2);

                    if (rounded !== event.target.value && rounded !== '') {
                        onChange({ value_number: rounded, value_text: '' });
                    }
                }}
                onChange={(event) => {
                    onChange({
                        value_number: limitDecimalPlaces(event.target.value, 2),
                        value_text: '',
                    });
                }}
            />
        );
    }

    if (canonicalType === 'duration_minutes') {
        return (
            <Input
                type="number"
                step="1"
                min="0"
                className="bg-background shadow-sm transition-all"
                placeholder="Durasi dalam menit..."
                value={valueNumber}
                readOnly={readOnly}
                required={required}
                onBlur={(event) => {
                    const rounded = roundToInteger(event.target.value);

                    if (rounded !== event.target.value && rounded !== '') {
                        onChange({ value_number: rounded, value_text: '' });
                    }
                }}
                onChange={(event) => {
                    onChange({
                        value_number: event.target.value,
                        value_text: '',
                    });
                }}
            />
        );
    }

    if (canonicalType === 'integer') {
        return (
            <Input
                type="number"
                step="1"
                min="0"
                className="bg-background shadow-sm transition-all"
                placeholder="Masukkan angka..."
                value={valueNumber}
                readOnly={readOnly}
                required={required}
                onBlur={(event) => {
                    const rounded = roundToInteger(event.target.value);

                    if (rounded !== event.target.value && rounded !== '') {
                        onChange({ value_number: rounded, value_text: '' });
                    }
                }}
                onChange={(event) => {
                    onChange({
                        value_number: event.target.value,
                        value_text: '',
                    });
                }}
            />
        );
    }

    if (canonicalType === 'option') {
        return (
            <StandardToggle
                value={valueText}
                disabled={readOnly}
                onChange={(nextValue) => {
                    onChange({ value_text: nextValue, value_number: '' });
                }}
            />
        );
    }

    if (canonicalType === 'option_with_manual') {
        return (
            <div className="flex w-full flex-col items-start gap-2">
                <StandardWithManualToggle
                    value={
                        valueText === 'Standar'
                            ? 'Standar'
                            : valueText
                              ? 'Lainnya'
                              : ''
                    }
                    disabled={readOnly}
                    onChange={(nextMode) => {
                        onChange({
                            value_text: nextMode === 'Lainnya' ? ' ' : nextMode,
                            value_number: '',
                        });
                    }}
                />
                {valueText && valueText !== 'Standar' ? (
                    <Input
                        className="w-full animate-in bg-background shadow-sm transition-all fade-in slide-in-from-top-2"
                        placeholder="Masukkan kondisi aktual..."
                        value={valueText === ' ' ? '' : valueText}
                        readOnly={readOnly}
                        required={required}
                        onChange={(event) => {
                            onChange({
                                value_text: event.target.value,
                                value_number: '',
                            });
                        }}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <Input
            className="bg-background shadow-sm transition-all"
            placeholder="Masukkan data..."
            value={valueText}
            readOnly={readOnly}
            required={required}
            onChange={(event) => {
                onChange({ value_text: event.target.value, value_number: '' });
            }}
        />
    );
}

type ToggleProps = {
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
};

function StandardToggle({ value, disabled = false, onChange }: ToggleProps) {
    return (
        <div className="inline-flex overflow-hidden rounded-lg border border-border shadow-sm">
            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    onChange(value === 'Tidak Standar' ? '' : 'Tidak Standar')
                }
                className={[
                    'flex min-w-[110px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Tidak Standar'
                        ? 'bg-red-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-red-50 hover:text-red-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <X className="size-4" />
                Tidak Standar
            </button>
            <div className="w-px bg-border" />
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Standar' ? '' : 'Standar')}
                className={[
                    'flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Standar'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <Check className="size-4" />
                Standar
            </button>
        </div>
    );
}

function StandardWithManualToggle({
    value,
    disabled = false,
    onChange,
}: ToggleProps) {
    return (
        <div className="inline-flex overflow-hidden rounded-lg border border-border shadow-sm">
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Lainnya' ? '' : 'Lainnya')}
                className={[
                    'flex min-w-[100px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Lainnya'
                        ? 'bg-amber-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-amber-50 hover:text-amber-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <Pencil className="size-4" />
                Yang lain...
            </button>
            <div className="w-px bg-border" />
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === 'Standar' ? '' : 'Standar')}
                className={[
                    'flex min-w-[90px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 select-none',
                    !disabled && 'cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-60',
                    value === 'Standar'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : 'bg-background text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <Check className="size-4" />
                Standar
            </button>
        </div>
    );
}
