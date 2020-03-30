/* eslint-disable */
/**
 * 将颜色值转换为你需要的格式，现在仅支持浏览器支持的HEX/RGB/RGBA/HSL/HSLA等5种格式，任意格式之间互相转换。
 * github: https://github.com/fxss5201/colorFormat
 */

import colorConstant from './colorConstant';

export default class ColorFormat {
    constructor(options) {
        return this._colorFormat(options);
    }
    _colorFormat(options) {
        let result;
        let color = (options && options.color && options.color.replace(/\s/g, '').toLowerCase()) || '#f00'; // color ：默认值为 "#f00"
        let format = (options && options.format && options.format.replace(/\s/g, '').toLowerCase()) || 'rgb'; // format ：默认值为 "rgb"
        let rgbType = format.indexOf('rgba') == -1 ? 0 : 1; // rgbType 0表示rgb，1表示rgba
        let hslType = format.indexOf('hsla') == -1 ? 0 : 1; // hslType 0表示hsl，1表示hsla
        if (color.indexOf('#') > -1) {
            if (format == 'hex') {
                // hex 转 hex
                result = this.hexToRgb(color);
                result = this.rgbToHex(result);
            } else if (format.indexOf('rgb') > -1) {
                // hex 转 rgb/rgba
                result = this.hexToRgb(color, rgbType);
            } else if (format.indexOf('hsl') > -1) {
                // hex 转 hsl/hsla
                result = this.hexToRgb(color);
                result = this.rgbToHsl(result, hslType);
            }
        } else if (color.indexOf('rgb') > -1) {
            result = this.getRgb(color, rgbType); // rgb 转 rgb/rgba
            if (format == 'hex') {
                // rgb/rgba 转 hex
                result = this.rgbToHex(result);
            } else if (format.indexOf('hsl') > -1) {
                // rgb/rgba 转 hsl
                result = this.rgbToHsl(result, hslType);
            }
        } else if (color.indexOf('hsl') > -1) {
            result = this.getHsl(color, hslType);
            result = this.hslToRgb(result, rgbType); // hsl 转 rgb/rgba
            if (format == 'hex') {
                // hsl 转 hex
                result = this.rgbToHex(result);
            } else if (format.indexOf('hsl') > -1) {
                // hsl 转 hsl/hsla
                result = this.rgbToHsl(result, hslType);
            }
        } else {
            const defineColor = colorConstant;
            let resultRgb;
            for (let i = 0, len = defineColor.length; i < len; i++) {
                if (color == defineColor[i].name) {
                    resultRgb = defineColor[i].hex;
                    break;
                }
            }
            if (resultRgb && resultRgb.length > 0) {
                if (format == 'hex') {
                    // hex 转 hex
                    result = this.hexToRgb(resultRgb);
                    result = this.rgbToHex(result);
                } else if (format.indexOf('rgb') > -1) {
                    // hex 转 rgb/rgba
                    result = this.hexToRgb(resultRgb, rgbType);
                } else if (format.indexOf('hsl') > -1) {
                    // hex 转 hsl/hsla
                    result = this.hexToRgb(resultRgb);
                    result = this.rgbToHsl(result, hslType);
                }
            } else {
                console.log('参数color暂未定义');
            }
        }
        return result;
    }
    getRgb(rgb, type) {
        /**
         * 传入字符串的rgb，如 "rgb(255,0,255)" ，获取rgb的各个参数值
         */
        rgb = rgb.toLowerCase();
        let flag = rgb.indexOf('rgba') == -1 ? 0 : 1; // flag 0表示rgb，1表示rgba
        rgb = flag ? rgb.replace('rgba', '') : rgb.replace('rgb', '');
        rgb = rgb.replace(/\s/g, '').split(',');
        let red = Number(rgb[0].slice(1));
        var green = Number(rgb[1]);
        var blue = flag ? Number(rgb[2]) : Number(rgb[2].slice(0, -1));
        var opacity = flag ? (Number(rgb[3].slice(0, -1)) > 1 ? 1 : Number(rgb[3].slice(0, -1))) : 1;
        return {
            r: red,
            g: green,
            b: blue,
            o: opacity,
            complete: type ? `rgba(${[red, green, blue, opacity].join(',')})` : `${[red, green, blue].join(',')}`,
        };
    }
    getHsl(hsl, type) {
        /**
         * 传入字符串的hsl，如 "hsl(300,100%,50%)" ，获取hsl的各个参数值
         */
        hsl = hsl.toLowerCase();
        let flag = hsl.indexOf('hsla') == -1 ? 0 : 1; // flag 0表示hsl，1表示hsla
        hsl = flag ? hsl.replace('hsla', '') : hsl.replace('hsl', '');
        hsl = hsl.replace(/\s/g, '').split(',');
        let h = Number(hsl[0].slice(1));
        var s = parseInt(hsl[1]);
        var l = flag ? parseInt(hsl[2]) : parseInt(hsl[2].slice(0, -1));
        var opacity = flag ? (Number(hsl[3].slice(0, -1)) > 1 ? 1 : Number(hsl[3].slice(0, -1))) : 1;
        return {
            h,
            s: s / 100,
            l: l / 100,
            o: opacity,
            complete: type ? `hsla(${[h, s, l, opacity].join(',')})` : `hsl(${[h, s, l].join(',')})`,
        };
    }
    rgbToHex(rgb) {
        /**
         * 传入通过getRgb获取的rgb对象，将其转换为hex格式
         */
        let red = Number(rgb.r).toString(16);
        var green = Number(rgb.g).toString(16);
        var blue = Number(rgb.b).toString(16);
        var opacity = Math.round(rgb.o * 255).toString(16);
        var simpleType = 0; // 转换之后的HEX是否可以简化，也就是说6位转为3位，或者8位转为4位
        red.length < 2 && (red = 0 + red);
        green.length < 2 && (green = 0 + green);
        blue.length < 2 && (blue = 0 + blue);
        opacity.length < 2 && (opacity = 0 + opacity);
        red[0] == red[1] && green[0] == green[1] && blue[0] == blue[1] && opacity[0] == opacity[1] && (simpleType = 1);
        return {
            r: red,
            g: green,
            b: blue,
            o: opacity,
            complete: simpleType
                ? `#${red[0]}${green[0]}${blue[0]}${rgb.o == 1 ? '' : opacity}`
                : `#${red}${green}${blue}${rgb.o == 1 ? '' : opacity}`,
        };
    }
    rgbToHsl(rgb, type) {
        /**
         * 传入通过getRgb获取的rgb对象，将其转换为hsl格式
         */
        let r = Number(rgb.r) / 255;
        var g = Number(rgb.g) / 255;
        var b = Number(rgb.b) / 255;
        var o = Number(rgb.o);
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h;
        var s;
        var l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
            switch (max) {
                case r:
                    h = (g - b) / d;
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h *= 60;
            h = h < 0 ? h + 360 : h;
        }
        h = Math.round(h);
        s = `${Math.round(s * 100)}%`;
        l = `${Math.round(l * 100)}%`;
        return {
            h,
            s,
            l,
            o,
            complete: type ? `hsla(${[h, s, l, o].join(',')})` : `hsl(${[h, s, l].join(',')})`,
        };
    }
    hexToRgb(hex, type) {
        /**
         * 传入hex格式，如 "#ff00ff" ，转换为rgb格式
         */
        hex = hex.replace('#', '');
        let red;
        var green;
        var blue;
        var opacity;
        let hexsplit = hex.split('');
        if (hex.length == 3) {
            red = parseInt(hexsplit[0] + hexsplit[0], 16);
            green = parseInt(hexsplit[1] + hexsplit[1], 16);
            blue = parseInt(hexsplit[2] + hexsplit[2], 16);
            opacity = 1;
        } else if (hex.length == 4) {
            red = parseInt(hexsplit[0] + hexsplit[0], 16);
            green = parseInt(hexsplit[1] + hexsplit[1], 16);
            blue = parseInt(hexsplit[2] + hexsplit[2], 16);
            opacity = Math.round((parseInt(hexsplit[3] + hexsplit[3], 16) / 255) * 100) / 100;
        } else if (hex.length == 6) {
            red = parseInt(hexsplit[0] + hexsplit[1], 16);
            green = parseInt(hexsplit[2] + hexsplit[3], 16);
            blue = parseInt(hexsplit[4] + hexsplit[5], 16);
            opacity = 1;
        } else if (hex.length == 8) {
            red = parseInt(hexsplit[0] + hexsplit[1], 16);
            green = parseInt(hexsplit[2] + hexsplit[3], 16);
            blue = parseInt(hexsplit[4] + hexsplit[5], 16);
            opacity = Math.round((parseInt(hexsplit[6] + hexsplit[7], 16) / 255) * 100) / 100;
        }
        return {
            r: red,
            g: green,
            b: blue,
            o: opacity,
            complete: type ? `rgba(${[red, green, blue, opacity].join(',')})` : `${[red, green, blue].join(',')}`,
        };
    }
    hslToRgb(hsl, type) {
        /**
         * 传入通过getHsl获取的Hsl对象，将其转换为rgb格式
         */
        let h = Number(hsl.h);
        var s = Number(hsl.s);
        var l = Number(hsl.l);
        var o = Number(hsl.o);
        var r;
        var g;
        var b;
        if (s == 0) {
            r = g = b = l;
        } else {
            let temp2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var temp1 = 2 * l - temp2;
            h /= 360;
            let hue2rgb = function(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            r = hue2rgb(temp1, temp2, h + 1 / 3);
            g = hue2rgb(temp1, temp2, h);
            b = hue2rgb(temp1, temp2, h - 1 / 3);
        }
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);
        return {
            r,
            g,
            b,
            o,
            complete: type ? `rgba(${[r, g, b, o].join(',')})` : `rgb(${[r, g, b].join(',')})`,
        };
    }
}
