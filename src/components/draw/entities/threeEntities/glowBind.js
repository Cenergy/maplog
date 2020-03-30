/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-prototype-builtins */
/*
 * @Author: 郭博阳
 */
import FlyLine from './flyLine';

class GlowBind {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE;
        this.texture = object.hasOwnProperty('texture') ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty('color') ? object.color : 'rgba(255,138,0,1)';
        this.scene = object.scene;
        this.height = object.hasOwnProperty('height') ? object.height : 8;
        this.radius = object.hasOwnProperty('radius') ? object.radius : 20;
        this.requestId = null;
        this.container = [];
        this.flyShader = {
            vertexshader: ` 
                uniform float height; 
                uniform float radius; 
                varying float innerAlpha;
                void main() {
                        innerAlpha = 1.5 - position.y / height;
                        float x = position.x;
                        float y = position.y;
                        float z = position.z;
                        vec3 p = vec3(x*radius,y,z*radius);
                        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                }
                `,
            fragmentshader: ` 
                uniform sampler2D texture;
                uniform float u_opacity;
                uniform vec3 color;
                uniform float isTexture;
                varying float innerAlpha;
                void main() {
                    float red = color.x;
                    float green = color.y;
                    float blue = color.z;
                    float redr = red/255.0;
                    float greenr = green/255.0;
                    float bluer = blue/255.0;
                    vec3 cr = vec3(redr+red*innerAlpha,greenr+green*innerAlpha,bluer+blue*innerAlpha);
                    vec4 u_color = vec4(cr,min(1.0,u_opacity*innerAlpha*2.5));
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
        const points = [];
        for (let i = 0; i < 40; i += 1) {
            points.push(new THREE.Vector2(1, i * 100));
        }
        this.alpha = colorArr[1];
        const geometry = new THREE.LatheBufferGeometry(points, 256);
        const material = new this.THREE.ShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: 'v3' },
                texture: { value: this.texture, type: 't2' },
                u_opacity: { value: this.alpha, type: 'f' },
                height: { value: this.height, type: 'f' },
                radius: { value: this.radius / 37, type: 'f' },
                isTexture: { value: this.texture, type: 't2' },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.flyShader.vertexshader,
            fragmentShader: this.flyShader.fragmentshader,
            side: THREE.DoubleSide,
        });
        // 随机在区域中生成离子
        const mesh = new THREE.Mesh(geometry, material);
        this.plane = mesh;
        this.plane.rotateX(Math.PI / 2);
        // this.scene.add(this.plane);
    }

    setHeight(height) {
        this.height = height;
        this.plane.material.uniforms.height.value = this.height;
    }

    setColor(color) {
        this.color = color;
        const colorArr = this.getColorArr(this.color);
        // eslint-disable-next-line prefer-destructuring
        this.plane.material.uniforms.color.value = colorArr[0];
    }

    setAlpha(alpha) {
        this.alpha = alpha;
        this.plane.material.uniforms.u_opacity.value = this.alpha;
    }

    setRadius(radius) {
        this.radius = radius;
        this.plane.material.uniforms.radius.value = this.radius;
    }

    remove() {
        this.plane.material.dispose();
        this.plane.geometry.dispose();
        this.plane.parent.remove(this.plane);
        this.plane = null;
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
                GlowBind.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                GlowBind.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                GlowBind.pad2(Math.round(arr[2] * 1 || 0).toString(16)),
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

    // 根据圆心和半径画圆
    static _getCircle(center, radius) {
        const result = [];
        for (let i = 0; i < 361 * 4; i += 1) {
            // 角度转弧度
            const hudu = (i * Math.PI) / 180;
            const x1 = center[0] + Math.sin(hudu) * radius;
            const y1 = center[1] - Math.cos(hudu) * radius;
            result.push([x1, y1]);
        }
        return result;
    }

    // 提供添加缠绕线接口
    addFlyLine(obj) {
        const { tb, center } = obj;
        const radius = obj.radius ? obj.radius : this.radius;
        const height = obj.height ? obj.height : this.height;
        const texture = obj.texture ? obj.texture : undefined;
        const position = GlowBind._getCircle(center, radius / 100000);
        const color = obj.color ? obj.color : `rgba(255,140,0,1.0)`;
        const speed = obj.speed ? obj.speed : 4;
        const length = obj.length ? obj.length : 300;
        const width = obj.width ? obj.width : 70;
        for (let i = 0; i <= position.length - 1; i += 1) {
            position[i].push(height);
        }
        const rp = tb.utils.lnglatsToWorld(position);
        const config = {
            // 材质,也可以不写,缺乏渐变效果
            texture,
            // 颜色以及透明度
            color,
            // 坐标[{x,y,z},{x,y,z}]
            position: rp,
            // 线宽
            width,
            // 线长度
            length,
            // 播放速度
            speed,
            // 循环次数,默认无限大
            repeat: Infinity,
            // THREE对象
            THREE: this.THREE,
        };
        // eslint-disable-next-line no-unused-expressions
        !texture ? delete config.texture : '';
        const line = new FlyLine(config);
        // this.container.push(line);
        // const l = tb.Object3D({ obj: line.line });
        // tb.add(l);
        // line.animation();
        // console.log('Rd: GlowBind -> addFlyLine -> line', line);
        return line;
    }
}

// eslint-disable-next-line import/prefer-default-export
export default GlowBind;
