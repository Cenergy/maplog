/* eslint-disable no-prototype-builtins */
/*
 * @Author: 郭博阳
 */
class FlyParticles {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE;
        this.texture = object.hasOwnProperty('texture') ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty('color') ? object.color : 'rgba(255,138,0,1)';
        this.size = object.hasOwnProperty('size') ? object.size : 1;
        this.height = object.hasOwnProperty('height') ? object.height : 10;
        this.speed = object.hasOwnProperty('speed') ? object.speed : 10;
        this.repeat = object.hasOwnProperty('repeat') ? object.repeat : Infinity;
        this.alpha = object.hasOwnProperty('alpha') ? object.alpha : 2;
        this.numbers = object.hasOwnProperty('numbers') ? object.numbers : 100;
        this.times = 0;
        this.scene = object.scene;
        this.randomPoints = [];
        this.position = object.position;
        this.requestId = null;
        this.flyShader = {
            vertexshader: ` 
                uniform float size; 
                uniform float time; 
                uniform float alpha; 
                uniform float height; 
                varying float u_opacitys;
                void main() {
                        if(time<height/2.0){
                            u_opacitys = time / height;
                        }else {
                            u_opacitys = 1.0 - time / height;
                        } 
                        vec3 p = vec3(position.x,position.y,position.z + time);
                        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = size;
                }
                `,
            fragmentshader: ` 
                uniform sampler2D texture;
                uniform float u_opacity;
                uniform vec3 color;
                uniform float isTexture;
                uniform float alpha; 
                varying float u_opacitys;
                void main() {
                    vec4 u_color = vec4(color,0.5+min(1.0,u_opacity*u_opacitys*alpha));
                    if( isTexture != 0.0 ){
                        gl_FragColor = u_color * texture2D(texture, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
                    }else{
                        gl_FragColor = u_color;
                    }
                }`,
        };
        this.init();
    }

    init() {
        const colorArr = this.getColorArr(this.color);
        const geometry = new this.THREE.BufferGeometry();
        const material = new this.THREE.ShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: 'v3' },
                size: { value: this.size, type: 'f' },
                texture: { value: this.texture, type: 't2' },
                u_opacity: { value: colorArr[1], type: 'f' },
                time: { value: 0, type: 'f' },
                isTexture: { value: this.texture, type: 'f' },
                height: { value: this.height, type: 'f' },
                alpha: { value: this.alpha, type: 'f' },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.flyShader.vertexshader,
            fragmentShader: this.flyShader.fragmentshader,
        });
        // 随机在区域中生成离子
        this.makePointsInRectangle();
        const position = [];
        this.randomPoints.forEach(function func(elem, index) {
            position.push(elem.x, elem.y, elem.z);
        });
        geometry.addAttribute('position', new this.THREE.Float32BufferAttribute(position, 3));
        const mesh = new this.THREE.Points(geometry, material);
        this.points = mesh;
        // this.scene.add(this.points);
        // this.animation()
    }

    // 在包围型内随机产生离子
    makePointsInRectangle() {
        let minx;
        let maxx;
        let miny;
        let maxy;
        this.position.forEach(item => {
            if (!maxx || maxx < item.x) {
                maxx = item.x;
            }
            if (!minx || minx > item.x) {
                minx = item.x;
            }
            if (!maxy || maxy < item.y) {
                maxy = item.y;
            }
            if (!miny || miny > item.y) {
                miny = item.y;
            }
        });
        let n = 0;
        while (n <= this.numbers) {
            const x = FlyParticles.randomNum(minx, maxx);
            const y = FlyParticles.randomNum(miny, maxy);
            const ifgo = FlyParticles.pointInPoly({ x, y }, this.position);
            // if(ifgo){
            n += 1;
            const z = FlyParticles.randomNum(0, this.height);
            this.randomPoints.push({
                x,
                y,
                z,
            });
            // }
        }
    }

    // 生成随机数
    static randomNum(minNum, maxNum) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * minNum + 1, 10);
            case 2:
                return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            default:
                return 0;
        }
    }

    remove() {
        this.points.material.dispose();
        this.points.geometry.dispose();
        this.points.parent.remove(this.points);
        this.points = null;
        this.times = 0;
        cancelAnimationFrame(this.requestId);
    }

    animation() {
        if (this.times >= this.repeat) {
            this.remove(this.points);
            return;
        }
        const { uniforms } = this.points.material;
        // 完结一次
        if (uniforms.time.value < this.height) {
            uniforms.time.value += this.baicSpeed * this.speed;
        } else {
            this.times += 1;
            uniforms.time.value = 0;
        }

        this.requestId = requestAnimationFrame(() => {
            this.animation();
        });
    }

    // rgb2uniform
    getColorArr(str) {
        if (Array.isArray(str)) return str;
        let arr = [];
        // eslint-disable-next-line no-param-reassign
        str += '';
        // eslint-disable-next-line no-param-reassign
        str = str.toLowerCase().replace(/\s/g, '');
        if (/^((?:rgba)?)\(\s*([^\)]*)/.test(str)) {
            arr = str.replace(/rgba\(|\)/gi, '').split(',');
            const hex = [
                FlyParticles.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                FlyParticles.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                FlyParticles.pad2(Math.round(arr[2] * 1 || 0).toString(16)),
            ];
            arr[0] = this._color(`#${hex.join('')}`);
            arr[1] = Math.max(0, Math.min(1, arr[3] * 1 || 0));
        } else if (str === 'transparent') {
            arr[0] = this._color();
            arr[1] = 0;
        } else {
            arr[0] = this._color(str);
            arr[1] = 1;
        }

        return arr;
    }

    _color(c) {
        return new this.THREE.Color(c);
    }

    static pad2(c) {
        return c.length === 1 ? `0${c}` : `${c}`;
    }

    // 点是否在面上
    static pointInPoly(pt, poly) {
        let c = false;
        // eslint-disable-next-line no-plusplus
        for (let i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            // eslint-disable-next-line no-unused-expressions
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) &&
                pt.x < ((poly[j].x - poly[i].x) * (pt.y - poly[i].y)) / (poly[j].y - poly[i].y) + poly[i].x &&
                (c = !c);
        return c;
    }
}

// eslint-disable-next-line import/prefer-default-export
export default FlyParticles;
