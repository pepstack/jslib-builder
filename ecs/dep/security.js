/**
 * RSA, a suite of routines for performing RSA public-key computations in JavaScript.
 * Copyright 1998-2005 David Shapiro.
 * Dave Shapiro
 * dave@ohdave.com
 * changed by Fuchun, 2010-05-06
 * fcrpg2005@gmail.com
 */
(function ($w, undefined) {
    'use strict';

    var biRadixBase = 2;
    var biRadixBits = 16;
    var bitsPerDigit = biRadixBits;
    var biRadix = 65536;     // 1 << 16 = 2^16 = 65536
    var biHalfRadix = 32768; // biRadix >>> 1;
    var biRadixSquared = biRadix * biRadix;
    var maxDigitVal = biRadix - 1;
    var maxInteger = 9999999999999998;

    // maxDigits:
    //   Change this to accommodate your largest number size. Use setMaxDigits()
    //   to change it!
    //
    // In general, if you're working with numbers of size N bits, you'll need 2*N
    //   bits of storage. Each digit holds 16 bits. So, a 1024-bit key will need
    //
    // 1024 * 2 / 16 = 128 digits of storage.
    //
    var maxDigits;
    var ZERO_ARRAY;
    var bigZero, bigOne;

    var BigInt = $w.BigInt = function (flag) {
        if (typeof flag === "boolean" && flag === true) {
            this.digits = null;
        } else {
            this.digits = ZERO_ARRAY.slice(0);
        }
        this.isNeg = false;
    };

    var RSA = {};

    RSA.setMaxDigits = function (value) {
        maxDigits = value;
        ZERO_ARRAY = [];
        var iza;
        for (iza = 0; iza < maxDigits; iza++) {
            ZERO_ARRAY[iza] = 0;
        }
        bigZero = new BigInt();
        bigOne = new BigInt();
        bigOne.digits[0] = 1;
    };
    RSA.setMaxDigits(20);

    //The maximum number of digits in base 10 you can convert to an
    //integer without JavaScript throwing up on you.
    var dpl10 = 15;

    RSA.biFromNumber = function (i) {
        var result = new BigInt();
        result.isNeg = i < 0;
        i = Math.abs(i);
        var j = 0;
        while (i > 0) {
            result.digits[j++] = i & maxDigitVal;
            i = Math.floor(i / biRadix);
        }
        return result;
    };

    //lr10 = 10 ^ dpl10
    var lr10 = RSA.biFromNumber(1000000000000000);

    RSA.biFromDecimal = function (s) {
        var isNeg = s.charAt(0) === '-';
        var i = isNeg ? 1 : 0;
        var result;

        // Skip leading zeros.
        while (i < s.length && s.charAt(i) === '0') {
            ++i;
        }

        if (i === s.length) {
            result = new BigInt();
        } else {
            var digitCount = s.length - i;
            var fgl = digitCount % dpl10;
            if (fgl === 0) {
                fgl = dpl10;
            }
            result = RSA.biFromNumber(Number(s.substr(i, fgl)));
            i += fgl;
            while (i < s.length) {
                result = RSA.biAdd(RSA.biMultiply(result, lr10),
                    RSA.biFromNumber(Number(s.substr(i, dpl10))));
                i += dpl10;
            }
            result.isNeg = isNeg;
        }
        return result;
    };

    RSA.biCopy = function (bi) {
        var result = new BigInt(true);
        result.digits = bi.digits.slice(0);
        result.isNeg = bi.isNeg;
        return result;
    };

    RSA.reverseStr = function (s) {
        var result = "";
        var i;
        for (i = s.length - 1; i > -1; --i) {
            result += s.charAt(i);
        }
        return result;
    };

    var hexatrigesimalToChar = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'
    ];

    RSA.biToString = function (x, radix) { // 2 <= radix <= 36
        var b = new BigInt();
        b.digits[0] = radix;
        var qr = RSA.biDivideModulo(x, b);
        var result = hexatrigesimalToChar[qr[1].digits[0]];
        while (RSA.biCompare(qr[0], bigZero) === 1) {
            qr = RSA.biDivideModulo(qr[0], b);
            result += hexatrigesimalToChar[qr[1].digits[0]];
        }
        return (x.isNeg ? "-" : "") + RSA.reverseStr(result);
    };

    RSA.biToDecimal = function (x) {
        var b = new BigInt();
        b.digits[0] = 10;
        var qr = RSA.biDivideModulo(x, b);
        var result = String(qr[1].digits[0]);
        while (RSA.biCompare(qr[0], bigZero) === 1) {
            qr = RSA.biDivideModulo(qr[0], b);
            result += String(qr[1].digits[0]);
        }
        return (x.isNeg ? "-" : "") + RSA.reverseStr(result);
    };

    var hexToChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f'];

    RSA.digitToHex = function (n) {
        var i,
            mask = 0xf,
            result = "";
        for (i = 0; i < 4; ++i) {
            result += hexToChar[n & mask];
            n >>>= 4;
        }
        return RSA.reverseStr(result);
    };

    RSA.biToHex = function (x) {
        var result = "";
        var i, n = RSA.biHighIndex(x);
        for (i = RSA.biHighIndex(x); i > -1; --i) {
            result += RSA.digitToHex(x.digits[i]);
        }
        return result;
    };

    RSA.charToHex = function (c) {
        var ZERO = 48;
        var NINE = ZERO + 9;
        var littleA = 97;
        var littleZ = littleA + 25;
        var bigA = 65;
        var bigZ = 65 + 25;
        var result;

        if (c >= ZERO && c <= NINE) {
            result = c - ZERO;
        } else if (c >= bigA && c <= bigZ) {
            result = 10 + c - bigA;
        } else if (c >= littleA && c <= littleZ) {
            result = 10 + c - littleA;
        } else {
            result = 0;
        }
        return result;
    };

    RSA.hexToDigit = function (s) {
        var i, result = 0;
        var sl = Math.min(s.length, 4);
        for (i = 0; i < sl; ++i) {
            result <<= 4;
            result |= RSA.charToHex(s.charCodeAt(i));
        }
        return result;
    };

    RSA.biFromHex = function (s) {
        var result = new BigInt();
        var i, j, sl = s.length;
        for (i = sl, j = 0; i > 0; i -= 4, ++j) {
            result.digits[j] = RSA.hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)));
        }
        return result;
    };

    RSA.biFromString = function (s, radix) {
        var isNeg = s.charAt(0) === '-';
        var istop = isNeg ? 1 : 0;
        var result = new BigInt();
        var place = new BigInt();
        place.digits[0] = 1; // radix^0
        var i;
        for (i = s.length - 1; i >= istop; i--) {
            var c = s.charCodeAt(i);
            var digit = RSA.charToHex(c);
            var biDigit = RSA.biMultiplyDigit(place, digit);
            result = RSA.biAdd(result, biDigit);
            place = RSA.biMultiplyDigit(place, radix);
        }
        result.isNeg = isNeg;
        return result;
    };

    RSA.biDump = function (b) {
        return (b.isNeg ? "-" : "") + b.digits.join(" ");
    };

    RSA.biAdd = function (x, y) {
        var result;

        if (x.isNeg !== y.isNeg) {
            y.isNeg = !y.isNeg;
            result = RSA.biSubtract(x, y);
            y.isNeg = !y.isNeg;
        } else {
            result = new BigInt();
            var c = 0;
            var i, n;
            for (i = 0; i < x.digits.length; ++i) {
                n = x.digits[i] + y.digits[i] + c;
                result.digits[i] = n % biRadix;
                c = Number(n >= biRadix);
            }
            result.isNeg = x.isNeg;
        }
        return result;
    };

    RSA.biSubtract = function (x, y) {
        var result;
        if (x.isNeg !== y.isNeg) {
            y.isNeg = !y.isNeg;
            result = RSA.biAdd(x, y);
            y.isNeg = !y.isNeg;
        } else {
            result = new BigInt();
            var n, c, i;
            c = 0;
            for (i = 0; i < x.digits.length; ++i) {
                n = x.digits[i] - y.digits[i] + c;
                result.digits[i] = n % biRadix;
                // Stupid non-conforming modulus operation.
                if (result.digits[i] < 0) {
                    result.digits[i] += biRadix;
                }
                c = -Number(n < 0);
            }

            // Fix up the negative sign, if any.
            if (c === -1) {
                c = 0;
                for (i = 0; i < x.digits.length; ++i) {
                    n = c - result.digits[i];
                    result.digits[i] = n % biRadix;
                    // Stupid non-conforming modulus operation.
                    if (result.digits[i] < 0) {
                        result.digits[i] += biRadix;
                    }
                    c = -(Number(n < 0));
                }
                // Result is opposite sign of arguments.
                result.isNeg = !x.isNeg;
            } else {
                // Result is same sign.
                result.isNeg = x.isNeg;
            }
        }
        return result;
    };

    RSA.biHighIndex = function (x) {
        var result = x.digits.length - 1;
        while (result > 0 && x.digits[result] === 0) {
            --result;
        }
        return result;
    };

    RSA.biNumBits = function (x) {
        var n = RSA.biHighIndex(x);
        var d = x.digits[n];
        var m = (n + 1) * bitsPerDigit;
        var result;
        for (result = m; result > m - bitsPerDigit; --result) {
            if ((d & 0x8000) !== 0) {
                break;
            }
            d <<= 1;
        }
        return result;
    };

    RSA.biMultiply = function (x, y) {
        var result = new BigInt();
        var c;
        var n = RSA.biHighIndex(x);
        var t = RSA.biHighIndex(y);
        var u, uv, i, j, k;

        for (i = 0; i <= t; ++i) {
            c = 0;
            k = i;
            for (j = 0; j <= n; ++j, ++k) {
                uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
                result.digits[k] = uv & maxDigitVal;
                c = uv >>> biRadixBits;
                //c = Math.floor(uv / biRadix);
            }
            result.digits[i + n + 1] = c;
        }
        // Someone give me a logical xor, please.
        result.isNeg = x.isNeg !== y.isNeg;
        return result;
    };

    RSA.biMultiplyDigit = function (x, y) {
        var uv, j,
            result = new BigInt(),
            n = RSA.biHighIndex(x),
            c = 0;

        for (j = 0; j <= n; ++j) {
            uv = result.digits[j] + x.digits[j] * y + c;
            result.digits[j] = uv & maxDigitVal;
            c = uv >>> biRadixBits;
            //c = Math.floor(uv / biRadix);
        }
        result.digits[1 + n] = c;
        return result;
    };

    RSA.arrayCopy = function (src, srcStart, dest, destStart, n) {
        var m = Math.min(srcStart + n, src.length);
        var i, j;
        for (i = srcStart, j = destStart; i < m; ++i, ++j) {
            dest[j] = src[i];
        }
    };

    var highBitMasks = [0x0000, 0x8000, 0xC000, 0xE000, 0xF000, 0xF800,
            0xFC00, 0xFE00, 0xFF00, 0xFF80, 0xFFC0, 0xFFE0,
            0xFFF0, 0xFFF8, 0xFFFC, 0xFFFE, 0xFFFF];

    RSA.biShiftLeft = function (x, n) {
        var digitCount = Math.floor(n / bitsPerDigit);
        var result = new BigInt();
        RSA.arrayCopy(x.digits, 0, result.digits, digitCount,
            result.digits.length - digitCount);
        var bits = n % bitsPerDigit;
        var rightBits = bitsPerDigit - bits;
        var i, i1;
        for (i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
            result.digits[i] = ((result.digits[i] << bits) & maxDigitVal) |
                ((result.digits[i1] & highBitMasks[bits]) >>> rightBits);
        }
        result.digits[0] = ((result.digits[i] << bits) & maxDigitVal);
        result.isNeg = x.isNeg;
        return result;
    };

    var lowBitMasks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
            0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
            0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];

    RSA.biShiftRight = function (x, n) {
        var digitCount = Math.floor(n / bitsPerDigit);
        var result = new BigInt();
        RSA.arrayCopy(x.digits, digitCount, result.digits, 0,
                  x.digits.length - digitCount);
        var bits = n % bitsPerDigit;
        var leftBits = bitsPerDigit - bits;
        var i, i1;
        for (i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
            result.digits[i] = (result.digits[i] >>> bits) | ((result.digits[i1] & lowBitMasks[bits]) << leftBits);
        }
        result.digits[result.digits.length - 1] >>>= bits;
        result.isNeg = x.isNeg;
        return result;
    };

    RSA.biMultiplyByRadixPower = function (x, n) {
        var result = new BigInt();
        RSA.arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
        return result;
    };

    RSA.biDivideByRadixPower = function (x, n) {
        var result = new BigInt();
        RSA.arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
        return result;
    };

    RSA.biModuloByRadixPower = function (x, n) {
        var result = new BigInt();
        RSA.arrayCopy(x.digits, 0, result.digits, 0, n);
        return result;
    };

    RSA.biCompare = function (x, y) {
        if (x.isNeg !== y.isNeg) {
            return 1 - 2 * Number(x.isNeg);
        }
        var i;
        for (i = x.digits.length - 1; i >= 0; --i) {
            if (x.digits[i] !== y.digits[i]) {
                if (x.isNeg) {
                    return 1 - 2 * Number(x.digits[i] > y.digits[i]);
                }
                return 1 - 2 * Number(x.digits[i] < y.digits[i]);
            }
        }
        return 0;
    };

    RSA.biDivideModulo = function (x, y) {
        var nb = RSA.biNumBits(x);
        var tb = RSA.biNumBits(y);
        var origYIsNeg = y.isNeg;
        var q, r;
        if (nb < tb) {
            // |x| < |y|
            if (x.isNeg) {
                q = RSA.biCopy(bigOne);
                q.isNeg = !y.isNeg;
                x.isNeg = false;
                y.isNeg = false;
                r = RSA.biSubtract(y, x);
                // Restore signs, 'cause they're references.
                x.isNeg = true;
                y.isNeg = origYIsNeg;
            } else {
                q = new BigInt();
                r = RSA.biCopy(x);
            }
            return [q, r];
        }

        q = new BigInt();
        r = x;

        // Normalize Y.
        var t = Math.ceil(tb / bitsPerDigit) - 1;
        var lambda = 0;
        while (y.digits[t] < biHalfRadix) {
            y = RSA.biShiftLeft(y, 1);
            ++lambda;
            ++tb;
            t = Math.ceil(tb / bitsPerDigit) - 1;
        }
        // Shift r over to keep the quotient constant. We'll shift the
        // remainder back at the end.
        r = RSA.biShiftLeft(r, lambda);
        nb += lambda; // Update the bit count for x.
        var n = Math.ceil(nb / bitsPerDigit) - 1;

        var b = RSA.biMultiplyByRadixPower(y, n - t);
        while (RSA.biCompare(r, b) !== -1) {
            ++q.digits[n - t];
            r = RSA.biSubtract(r, b);
        }
        var i;
        for (i = n; i > t; --i) {
            var ri = (i >= r.digits.length) ? 0 : r.digits[i];
            var ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
            var ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
            var yt = (t >= y.digits.length) ? 0 : y.digits[t];
            var yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];

            if (ri === yt) {
                q.digits[i - t - 1] = maxDigitVal;
            } else {
                q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
            }

            var c1 = q.digits[i - t - 1] * ((yt * biRadix) + yt1);
            var c2 = (ri * biRadixSquared) + ((ri1 * biRadix) + ri2);
            while (c1 > c2) {
                --q.digits[i - t - 1];
                c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
                c2 = (ri * biRadix * biRadix) + ((ri1 * biRadix) + ri2);
            }

            b = RSA.biMultiplyByRadixPower(y, i - t - 1);
            r = RSA.biSubtract(r, RSA.biMultiplyDigit(b, q.digits[i - t - 1]));
            if (r.isNeg) {
                r = RSA.biAdd(r, b);
                --q.digits[i - t - 1];
            }
        }
        r = RSA.biShiftRight(r, lambda);
        // Fiddle with the signs and stuff to make sure that 0 <= r < y.
        q.isNeg = x.isNeg !== origYIsNeg;
        if (x.isNeg) {
            if (origYIsNeg) {
                q = RSA.biAdd(q, bigOne);
            } else {
                q = RSA.biSubtract(q, bigOne);
            }
            y = RSA.biShiftRight(y, lambda);
            r = RSA.biSubtract(y, r);
        }
        // Check for the unbelievably stupid degenerate case of r == -0.
        if (r.digits[0] === 0 && RSA.biHighIndex(r) === 0) {
            r.isNeg = false;
        }

        return [q, r];
    };

    RSA.biDivide = function (x, y) {
        return RSA.biDivideModulo(x, y)[0];
    };

    RSA.biModulo = function (x, y) {
        return RSA.biDivideModulo(x, y)[1];
    };

    RSA.biMultiplyMod = function (x, y, m) {
        return RSA.biModulo(RSA.biMultiply(x, y), m);
    };

    RSA.biPow = function (x, y) {
        var result = bigOne;
        var a = x;
        while (true) {
            if ((y & 1) !== 0) {
                result = RSA.biMultiply(result, a);
            }
            y >>= 1;
            if (y === 0) {
                break;
            }
            a = RSA.biMultiply(a, a);
        }
        return result;
    };

    RSA.biPowMod = function (x, y, m) {
        var result = bigOne;
        var a = x;
        var k = y;
        while (true) {
            if ((k.digits[0] & 1) !== 0) {
                result = RSA.biMultiplyMod(result, a, m);
            }
            k = RSA.biShiftRight(k, 1);
            if (k.digits[0] === 0 && RSA.biHighIndex(k) === 0) {
                break;
            }
            a = RSA.biMultiplyMod(a, a, m);
        }
        return result;
    };

    var BarrettMu_modulo = function (x) {
        var $dmath = RSA;
        var q1 = $dmath.biDivideByRadixPower(x, this.k - 1);
        var q2 = $dmath.biMultiply(q1, this.mu);
        var q3 = $dmath.biDivideByRadixPower(q2, this.k + 1);
        var r1 = $dmath.biModuloByRadixPower(x, this.k + 1);
        var r2term = $dmath.biMultiply(q3, this.modulus);
        var r2 = $dmath.biModuloByRadixPower(r2term, this.k + 1);
        var r = $dmath.biSubtract(r1, r2);
        if (r.isNeg) {
            r = $dmath.biAdd(r, this.bkplus1);
        }
        var rgtem = $dmath.biCompare(r, this.modulus) >= 0;
        while (rgtem) {
            r = $dmath.biSubtract(r, this.modulus);
            rgtem = $dmath.biCompare(r, this.modulus) >= 0;
        }
        return r;
    };

    var BarrettMu_multiplyMod = function (x, y) {
        /*
        x = this.modulo(x);
        y = this.modulo(y);
        */
        var xy = RSA.biMultiply(x, y);
        return this.modulo(xy);
    };

    var BarrettMu_powMod = function (x, y) {
        var result = new BigInt();
        result.digits[0] = 1;
        var a = x;
        var k = y;
        while (true) {
            if ((k.digits[0] & 1) !== 0) {
                result = this.multiplyMod(result, a);
            }
            k = RSA.biShiftRight(k, 1);
            if (k.digits[0] === 0 && RSA.biHighIndex(k) === 0) {
                break;
            }
            a = this.multiplyMod(a, a);
        }
        return result;
    };

    $w.BarrettMu = function (m) {
        this.modulus = RSA.biCopy(m);
        this.k = RSA.biHighIndex(this.modulus) + 1;
        var b2k = new BigInt();
        b2k.digits[2 * this.k] = 1; // b2k = b^(2k)
        this.mu = RSA.biDivide(b2k, this.modulus);
        this.bkplus1 = new BigInt();
        this.bkplus1.digits[this.k + 1] = 1; // bkplus1 = b^(k+1)
        this.modulo = BarrettMu_modulo;
        this.multiplyMod = BarrettMu_multiplyMod;
        this.powMod = BarrettMu_powMod;
    };


    var RSAKeyPair = function (encryptionExponent, decryptionExponent, modulus) {
        var $dmath = RSA;
        this.e = $dmath.biFromHex(encryptionExponent);
        this.d = $dmath.biFromHex(decryptionExponent);
        this.m = $dmath.biFromHex(modulus);
        // We can do two bytes per digit, so
        // chunkSize = 2 * (number of digits in modulus - 1).
        // Since biHighIndex returns the high index, not the number of digits, 1 has
        // already been subtracted.
        this.chunkSize = 2 * $dmath.biHighIndex(this.m);
        this.radix = 16;
        this.barrett = new $w.BarrettMu(this.m);
    };

    RSA.getKeyPair = function (encryptionExponent, decryptionExponent, modulus) {
        return new RSAKeyPair(encryptionExponent, decryptionExponent, modulus);
    };

    if ($w.twoDigit === undefined) {
        $w.twoDigit = function (n) {
            return (n < 10 ? "0" : "") + String(n);
        };
    }

    // Altered by Rob Saunders (rob@robsaunders.net). New routine pads the
    // string after it has been converted to an array. This fixes an
    // incompatibility with Flash MX's ActionScript.
    RSA.encryptedString = function (key, s) {
        var a = [];
        var sl = s.length;
        var i = 0;
        while (i < sl) {
            a[i] = s.charCodeAt(i);
            i++;
        }

        while (a.length % key.chunkSize !== 0) {
            a[i++] = 0;
        }

        var al = a.length;
        var result = "";
        var j, k, block;
        for (i = 0; i < al; i += key.chunkSize) {
            block = new BigInt();
            j = 0;
            for (k = i; k < i + key.chunkSize; ++j) {
                block.digits[j] = a[k++];
                block.digits[j] += a[k++] << 8;
            }
            var crypt = key.barrett.powMod(block, key.e);
            var text = key.radix === 16 ? RSA.biToHex(crypt) : RSA.biToString(crypt, key.radix);
            result += text + " ";
        }
        return result.substring(0, result.length - 1); // Remove last space.
    };

    RSA.decryptedString = function (key, s) {
        var blocks = s.split(" ");
        var result = "";
        var i, j, block;
        for (i = 0; i < blocks.length; ++i) {
            var bi;
            if (key.radix === 16) {
                bi = RSA.biFromHex(blocks[i]);
            } else {
                bi = RSA.biFromString(blocks[i], key.radix);
            }
            block = key.barrett.powMod(bi, key.d);
            for (j = 0; j <= RSA.biHighIndex(block); ++j) {
                result += String.fromCharCode(block.digits[j] & 255, block.digits[j] >> 8);
            }
        }
        // Remove trailing null, if any.
        if (result.charCodeAt(result.length - 1) === 0) {
            result = result.substring(0, result.length - 1);
        }
        return result;
    };

    var RC4 = {};

    RC4.encrypt = function (aInput, aKey) {
        var iS = [];
        var iK = [];
        var keyLen = aKey.length;
        var i, j, k, temp;
        for (i = 0; i < 256; i++) {
            iS[i] = i;
            iK[i] = aKey.charCodeAt((i % keyLen)) % 256;
        }
        j = 0;
        for (i = 0; i < 256; i++) {
            j = (j + iS[i] + iK[i]) % 256;
            temp = iS[i];
            iS[i] = iS[j];
            iS[j] = temp;
        }

        var outChars = [];
        i = 0;
        j = 0;
        for (k = 0; k < aInput.length; k++) {
            i = (i + 1) % 256;
            j = (j + iS[i]) % 256;
            temp = iS[i];
            iS[i] = iS[j];
            iS[j] = temp;

            var iY = iS[(iS[i] + (iS[j] % 256)) % 256];
            var iCode = aInput.charCodeAt(k) ^ iY;
            outChars[k] = String.fromCharCode(iCode);
        }
        return outChars.join('');
    };


    RC4.fromHexString = function (hexstr) {
        var outChars = [];
        var icode, n, num = hexstr.length / 4;
        for (n = 0; n < num; n++) {
            icode = RSA.hexToDigit(hexstr.substr(4 * n, 4));
            outChars[n] = String.fromCharCode(icode);
        }
        return outChars.join('');
    };


    RC4.toHexString = function (str) {
        var hexstr = "";
        var i, ival, hexcode;
        for (i = 0; i < str.length; i++) {
            ival = str.charCodeAt(i);

            hexcode = ival.toString(16);
            while (hexcode.length < 4) {
                hexcode = '0' + hexcode;
            }
            hexstr += hexcode;
        }
        return hexstr;
    };

    RSA.setMaxDigits(130);


    if ($w.RSAUtil === undefined) {
        $w.RSAUtil = RSA;
    }

    if ($w.RC4Util === undefined) {
        $w.RC4Util = RC4;
    }
}(window));
