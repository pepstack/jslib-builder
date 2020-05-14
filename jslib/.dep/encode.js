/**
 * encode.js
 *    cheungmine
 * 2015-07-15
 */
(function ($w, undefined) {
    'use strict';

    var Encode = {
        utf16to8 : function (str) {
            var
                i,
                c,
                out = "",
                len = str.length;
            for (i = 0; i < len; i++) {
                c = str.charCodeAt(i);
                if ((c >= 0x0001) && (c <= 0x007F)) {
                    out += str.charAt(i);
                } else if (c > 0x07FF) {
                    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                    out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                } else {
                    out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                }
            }
            return out;
        },

        utf8to16 : function (str) {
            var
                c,
                char2,
                char3,
                i = 0,
                out = "",
                len = str.length;

            while (i < len) {
                c = str.charCodeAt(i++);
                switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt(i - 1);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
                }
            }
            return out;
        }
    };


    var Base64 = {
        // private property
        keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) + this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
            return output;
        },

        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            if (input.length % 4 !== 0) {
                return "";
            }

            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                return "";
            }

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);
                if (enc3 !== 64) {
                    output += String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output += String.fromCharCode(chr3);
                }
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
            return output;
        }
    };


    var MD5 = {
        hexcase : 0,
        b64pad : "",
        chrsz : 8,

        safe_add : function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        },

        bit_rol : function (num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        },

        binl2str : function (bin) {
            var i,
                str = "",
                mask = (1 << MD5.chrsz) - 1;
            for (i = 0; i < bin.length * 32; i += MD5.chrsz) {
                str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
            }
            return str;
        },

        binl2b64 : function (binarray) {
            var i,
                j,
                str = "",
                tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

            for (i = 0; i < binarray.length * 4; i += 3) {
                var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)
                    | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)
                    |  ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);

                for (j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 > binarray.length * 32) {
                        str += MD5.b64pad;
                    } else {
                        str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
                    }
                }
            }
            return str;
        },

        binl2hex : function (binarray) {
            var hex_tab = MD5.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var i, str = "";

            for (i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                    hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
            }
            return str;
        },

        str2binl : function (str) {
            var bin = [];
            var mask = (1 << MD5.chrsz) - 1;
            var i;
            for (i = 0; i < str.length * MD5.chrsz; i += MD5.chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / MD5.chrsz) & mask) << (i % 32);
            }
            return bin;
        },

        md5_cmn : function (q, a, b, x, s, t) {
            return MD5.safe_add(MD5.bit_rol(MD5.safe_add(MD5.safe_add(a, q), MD5.safe_add(x, t)), s), b);
        },

        md5_ff : function (a, b, c, d, x, s, t) {
            return MD5.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        },

        md5_gg : function (a, b, c, d, x, s, t) {
            return MD5.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        },

        md5_hh : function (a, b, c, d, x, s, t) {
            return MD5.md5_cmn(b ^ c ^ d, a, b, x, s, t);
        },

        md5_ii : function (a, b, c, d, x, s, t) {
            return MD5.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        },

        core_md5 : function (x, len) {
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a =  1732584193,
                b = -271733879,
                c = -1732584194,
                d =  271733878,
                i;

            for (i = 0; i < x.length; i += 16) {
                var olda = a,
                    oldb = b,
                    oldc = c,
                    oldd = d;
                a = MD5.md5_ff(a, b, c, d, x[i], 7, -680876936);
                d = MD5.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = MD5.md5_ff(c, d, a, b, x[i + 2], 17,  606105819);
                b = MD5.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = MD5.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = MD5.md5_ff(d, a, b, c, x[i + 5], 12,  1200080426);
                c = MD5.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = MD5.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = MD5.md5_ff(a, b, c, d, x[i + 8], 7,  1770035416);
                d = MD5.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = MD5.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = MD5.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = MD5.md5_ff(a, b, c, d, x[i + 12], 7,  1804603682);
                d = MD5.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = MD5.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = MD5.md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);
                a = MD5.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = MD5.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = MD5.md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
                b = MD5.md5_gg(b, c, d, a, x[i], 20, -373897302);
                a = MD5.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = MD5.md5_gg(d, a, b, c, x[i + 10], 9,  38016083);
                c = MD5.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = MD5.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = MD5.md5_gg(a, b, c, d, x[i + 9], 5,  568446438);
                d = MD5.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = MD5.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = MD5.md5_gg(b, c, d, a, x[i + 8], 20,  1163531501);
                a = MD5.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = MD5.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = MD5.md5_gg(c, d, a, b, x[i + 7], 14,  1735328473);
                b = MD5.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
                a = MD5.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = MD5.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = MD5.md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
                b = MD5.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = MD5.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = MD5.md5_hh(d, a, b, c, x[i + 4], 11,  1272893353);
                c = MD5.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = MD5.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = MD5.md5_hh(a, b, c, d, x[i + 13], 4,  681279174);
                d = MD5.md5_hh(d, a, b, c, x[i], 11, -358537222);
                c = MD5.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = MD5.md5_hh(b, c, d, a, x[i + 6], 23,  76029189);
                a = MD5.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = MD5.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = MD5.md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
                b = MD5.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
                a = MD5.md5_ii(a, b, c, d, x[i], 6, -198630844);
                d = MD5.md5_ii(d, a, b, c, x[i + 7], 10,  1126891415);
                c = MD5.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = MD5.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = MD5.md5_ii(a, b, c, d, x[i + 12], 6,  1700485571);
                d = MD5.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = MD5.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = MD5.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = MD5.md5_ii(a, b, c, d, x[i + 8], 6,  1873313359);
                d = MD5.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = MD5.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = MD5.md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
                a = MD5.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = MD5.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = MD5.md5_ii(c, d, a, b, x[i + 2], 15,  718787259);
                b = MD5.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
                a = MD5.safe_add(a, olda);
                b = MD5.safe_add(b, oldb);
                c = MD5.safe_add(c, oldc);
                d = MD5.safe_add(d, oldd);
            }
            return [a, b, c, d];
        },

        hex_md5 : function (s) {
            return MD5.binl2hex(MD5.core_md5(MD5.str2binl(s), s.length * MD5.chrsz));
        },

        b64_md5 : function (s) {
            return MD5.binl2b64(MD5.core_md5(MD5.str2binl(s), s.length * MD5.chrsz));
        },

        str_md5 : function (s) {
            return MD5.binl2str(MD5.core_md5(MD5.str2binl(s), s.length * MD5.chrsz));
        },

        intarry2string : function (iarr) {
            var v, i, str = '';
            for (i = 0; i < iarr.length; i++) {
                v = Number(iarr[i]);
                str += String.fromCharCode((v >>> 24) & 0xFF);
                str += String.fromCharCode((v >>> 16) & 0xFF);
                str += String.fromCharCode((v >>> 8) & 0xFF);
                str += String.fromCharCode((v >>> 0) & 0xFF);
            }
            return str;
        },

        core_hmac_md5 : function (key, data) {
            var bkey = MD5.str_md5(key);
            var i,
                ipad = [], // bkey.length
                opad = []; // bkey.length

            for (i = 0; i < bkey.length; i++) {
                var vb = bkey.charCodeAt(i);
                ipad[i] = vb ^ 0x36363636;
                opad[i] = vb ^ 0x5C5C5C5C;
            }

            var sipad = MD5.intarry2string(ipad);
            var sopad = MD5.intarry2string(opad);
            var s = sopad + MD5.hex_md5(sipad + data);
            return MD5.core_md5(MD5.str2binl(s), s.length * MD5.chrsz);
        },

        hex_hmac_md5 : function (key, data) {
            return MD5.binl2hex(MD5.core_hmac_md5(key, data));
        },

        b64_hmac_md5 : function (key, data) {
            return MD5.binl2b64(MD5.core_hmac_md5(key, data));
        },

        str_hmac_md5 : function (key, data) {
            return MD5.binl2str(MD5.core_hmac_md5(key, data));
        },

        md5_vm_test : function () {
            // on linux command: $ echo -n "abc" | md5sum
            return (
                MD5.hex_md5("abc") === "900150983cd24fb0d6963f7d28e17f72" &&
                MD5.hex_hmac_md5("18902130", "abc") === "572ed8a3166b3b0de71bd205cfa35c6a" &&
                MD5.hex_hmac_md5("abcdg1028", "abc!$df#%de") === "6635f2eef89f9d489554c61de9a7c834"
            );
        }
    };


    if ($w.EncodeUtil === undefined) {
        $w.EncodeUtil = Encode;
    }

    if ($w.Base64Util === undefined) {
        $w.Base64Util = Base64;
    }

    if ($w.MD5Util === undefined) {
        $w.MD5Util = MD5;
    }
}(window));
