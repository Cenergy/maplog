/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */

class FlyLine {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE;
        this.texture = object.hasOwnProperty('texture') ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty('color') ? object.color : 'rgba(255,138,0,1)';
        this.width = object.hasOwnProperty('width') ? object.width : 1;
        this.length = object.hasOwnProperty('length') ? object.length : 10;
        this.speed = object.hasOwnProperty('speed') ? object.speed : 10;
        this.repeat = object.hasOwnProperty('repeat') ? object.repeat : Infinity;
        this.times = 0;
        // this.scene = object.scene
        this.position = object.position;
        this.requestId = null;
        this.flyShader = {
            vertexshader: ` 
                uniform float size; 
                uniform float time; 
                uniform float u_len; 
                attribute float u_index;
                varying float u_opacitys;
                void main() { 
                    if( u_index < time + u_len && u_index > time){
                        float u_scale = 1.0 - (time + u_len - u_index) /u_len;
                        u_opacitys = u_scale;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = size * u_scale * 300.0 / (-mvPosition.z);
                    }
                }
                `,
            // 利用材质填充
            fragmentshader: ` 
                uniform sampler2D texture;
                uniform float u_opacity;
                uniform vec3 color;
                uniform float isTexture;
                varying float u_opacitys;
                void main() {
                    vec4 u_color = vec4(color,u_opacity * u_opacitys);
                    if( isTexture != 0.0 ){
						gl_FragColor = u_color * texture2D(texture, 
							vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
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
                size: { value: this.width, type: 'f' },
                texture: { value: this.texture, type: 't2' },
                u_len: { value: this.length, type: 'f' },
                u_opacity: { value: colorArr[1], type: 'f' },
                time: { value: -this.length, type: 'f' },
                isTexture: { value: this.texture, type: 'f' },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.flyShader.vertexshader,
            fragmentShader: this.flyShader.fragmentshader,
            needsUpdate: true,
        });
        const position = [];
        const u_index = [];
        // eslint-disable-next-line func-names
        this.position.forEach(function(elem, index) {
            position.push(elem.x, elem.y, elem.z);
            u_index.push(index);
        });
        geometry.addAttribute('position', new this.THREE.Float32BufferAttribute(position, 3));
        geometry.addAttribute('u_index', new this.THREE.Float32BufferAttribute(u_index, 1));
        const mesh = new this.THREE.Points(geometry, material);
        this.line = mesh;
        // this.scene.add(this.line);
        // this.animation()
    }

    remove(tb) {
        this.line.material.dispose();
        this.line.geometry.dispose();
        tb.remove(this.line);
        this.line = null;
        this.times = 0;
        cancelAnimationFrame(this.requestId);
    }

    // uniforms.time.value代表点位在线上运行的轨迹
    animation() {
        if (this.times >= this.repeat) {
            this.remove(this.line);
            return;
        }
        const { uniforms } = this.line.material;
        // 完结一次
        if (uniforms.time.value < this.position.length) {
            uniforms.time.value += this.baicSpeed * this.speed;
        } else {
            this.times += 1;
            uniforms.time.value = -uniforms.u_len.value;
        }

        this.requestId = requestAnimationFrame(() => {
            this.animation();
        });
    }

    // rgb2uniform
    getColorArr(str) {
        if (Array.isArray(str)) return str;
        let arr = [];
        str += '';
        str = str.toLowerCase().replace(/\s/g, '');
        if (/^((?:rgba)?)\(\s*([^\)]*)/.test(str)) {
            arr = str.replace(/rgba\(|\)/gi, '').split(',');
            const hex = [
                FlyLine.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                FlyLine.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                FlyLine.pad2(Math.round(arr[2] * 1 || 0).toString(16)),
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
}

// eslint-disable-next-line import/prefer-default-export
export default FlyLine;
