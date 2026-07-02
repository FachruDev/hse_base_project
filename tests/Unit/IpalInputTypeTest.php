<?php

namespace Tests\Unit;

use App\Support\Ipal\InputType;
use PHPUnit\Framework\TestCase;

class IpalInputTypeTest extends TestCase
{
    public function test_it_normalizes_legacy_and_current_input_types(): void
    {
        $this->assertSame(InputType::Decimal2, InputType::canonical('number'));
        $this->assertSame(InputType::Option, InputType::canonical('option_standard'));
        $this->assertSame(InputType::Option, InputType::canonical('select'));
        $this->assertSame(InputType::Text, InputType::canonical('unknown'));
        $this->assertSame(InputType::DurationMinutes, InputType::canonical('duration_minutes'));
    }

    public function test_it_identifies_number_backed_input_types(): void
    {
        $this->assertTrue(InputType::storesNumber('number'));
        $this->assertTrue(InputType::storesNumber('decimal_2'));
        $this->assertTrue(InputType::storesNumber('duration_minutes'));
        $this->assertFalse(InputType::storesNumber('text'));
        $this->assertFalse(InputType::storesNumber('option'));
        $this->assertFalse(InputType::storesNumber('option_with_manual'));
    }
}
