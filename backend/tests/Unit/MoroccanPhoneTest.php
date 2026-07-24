<?php

namespace Tests\Unit;

use App\Rules\MoroccanPhone;
use PHPUnit\Framework\TestCase;

class MoroccanPhoneTest extends TestCase
{
    private MoroccanPhone $rule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rule = new MoroccanPhone;
    }

    private function fails(mixed $value): bool
    {
        $failed = false;
        $this->rule->validate('telephone', $value, function () use (&$failed) {
            $failed = true;
        });

        return $failed;
    }

    public function test_null_and_empty_are_allowed(): void
    {
        $this->assertFalse($this->fails(null));
        $this->assertFalse($this->fails(''));
    }

    public function test_non_string_is_rejected(): void
    {
        $this->assertTrue($this->fails(522000000));
        $this->assertTrue($this->fails(['0522000000']));
    }

    public function test_local_formats_accepted(): void
    {
        $this->assertFalse($this->fails('0522000000'));
        $this->assertFalse($this->fails('0522 00 00 00'));
        $this->assertFalse($this->fails('06-12-34-56-78'));
        $this->assertFalse($this->fails('0712345678'));
    }

    public function test_international_formats_accepted(): void
    {
        $this->assertFalse($this->fails('+212522000000'));
        $this->assertFalse($this->fails('+212 522 00 00 00'));
        $this->assertFalse($this->fails('212612345678'));
    }

    public function test_invalid_numbers_rejected(): void
    {
        $this->assertTrue($this->fails('123'));
        $this->assertTrue($this->fails('0123456789'));
        $this->assertTrue($this->fails('0422000000'));
        $this->assertTrue($this->fails('abc'));
        $this->assertTrue($this->fails('+33123456789'));
    }
}
