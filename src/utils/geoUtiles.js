/* eslint-disable no-restricted-properties */
export default class GeoUtiles {
    static cutLineInXSpaces(x, firstpoint, lastpoint) {
        if (firstpoint[0] === lastpoint[0] && firstpoint[1] === lastpoint[1]) {
            return undefined;
        }
        const baseLength = GeoUtiles.getBaseLength([firstpoint, lastpoint]);
        const length = baseLength / Number(x);
        const result = [];
        result.push(firstpoint);
        for (let i = 1; i <= x; i += 1) {
            const point = GeoUtiles.getThirdPoint(lastpoint, firstpoint, 0, length * i, true);
            result.push(point);
        }
        return result;
    }

    static getBaseLength(t) {
        return Math.pow(GeoUtiles.wholeDistance(t), 0.99);
    }

    // 输入起始点，结束点，相对方位角的旋转角度，长度，旋转角是否翻转
    static getThirdPoint(t, o, e, r, n) {
        if (t[0] === o[0] && t[1] === o[1]) {
            return o;
        }
        // 计算方位角
        const g = GeoUtiles.getAzimuth(t, o);
        // 基于方位角进行正向或反向计算
        const i = n ? g + e : g - e;
        const s = r * Math.cos(i);
        const a = r * Math.sin(i);
        return [o[0] + s, o[1] + a];
    }

    // 求两点连线和和纬线的夹角,方位角
    // 方位角指的是从西经水平方向逆时针转到两点连线的角度
    static getAzimuth(t, o) {
        let e;
        // 求两点连线和和纬线的夹角
        const r = Math.asin(Math.abs(o[1] - t[1]) / GeoUtiles.distance(t, o));
        // 第二个点经度纬度均大于第一个点
        if (o[1] >= t[1] && o[0] >= t[0]) {
            e = r + Math.PI;
            // 第二个点纬度高于第一个点，经度小于第一个点
        } else if (o[1] >= t[1] && o[0] < t[0]) {
            e = Math.PI * 2 - r;
            // 第二个点纬度小于第一个点，经度也小于第一个点
        } else if (o[1] < t[1] && o[0] < t[0]) {
            e = r;
        } else if (o[1] < t[1] && o[0] >= t[0]) {
            // 第二个点纬度小于第一个点，经度大于第一个点
            e = Math.PI - r;
        }
        return e;
    }

    static distance(t, o) {
        return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2));
    }

    static wholeDistance(t) {
        let o = 0;
        for (let e = 0; e < t.length - 1; e += 1) o += GeoUtiles.distance(t[e], t[e + 1]);
        return o;
    }

    // [[],[],[]]
    // 插值接口
    static lerpcoords(num, coords) {
        // 插值操作
        let morepoints = [];
        const nums = coords.length - 1;
        for (let i = 0; i <= coords.length - 2; i += 1) {
            const temppoints = GeoUtiles.cutLineInXSpaces(num / nums, coords[i], coords[i + 1]);
            morepoints = morepoints.concat(temppoints);
        }
        return morepoints;
    }

    // 飞线接口
    static flylines(three, vectors, num = 50) {
        const curve = new three.CatmullRomCurve3([...vectors]);
        const points = curve.getPoints(num);
        return points;
    }

    // 根据圆心和半径画圆，接口
    static getCircle(center, radius, gap = 1.0, circlenum = 4.0) {
        const result = [];
        for (let i = 0; i < 361 * circlenum; i += gap) {
            // 角度转弧度
            const hudu = (i * Math.PI) / 180;
            const x1 = center[0] + Math.sin(hudu) * radius;
            const y1 = center[1] - Math.cos(hudu) * radius;
            result.push([x1, y1]);
        }
        return result;
    }
}
