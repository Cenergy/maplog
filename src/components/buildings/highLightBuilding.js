/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-08 11:08:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class HighLightBuilding {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.outercolor = object.hasOwnProperty("outercolor") ? object.outercolor : "rgba(0,138,255,1)";
        this.scene = object.scene;
        this.distance = object.hasOwnProperty("distance") ? object.distance : 0.05;
        this.needbbox = object.hasOwnProperty("needbbox") ? object.needbbox : false;
        this.needskin = object.hasOwnProperty("needskin") ? object.needskin : false;
        this.times = 0;
        this.tb = object.threebox;
        this.turf = object.turf;
        this.position = object.position;
        this.skinheight = object.hasOwnProperty("skinheight") ? object.skinheight : 3;
        this.skincolor = object.hasOwnProperty("skincolor") ? object.skincolor : "rgba(255,138,0,0.2)";;
        const point = [this.position[0][0][0], this.position[0][0][1]]
        this.position[0].push(point)
        this.height = object.hasOwnProperty("height") ? object.height : 10;
        this.outerheight = object.hasOwnProperty("outerheight") ? object.outerheight : 20;
        this.container = []
        this.boxShader = {
            vertexshader: ` 
                precision highp float;
                uniform float height; 
                varying float innerAlpha;
                void main() {
                    innerAlpha = 2.3-position.z / height;
                    float x = position.x;
                    float y = position.y;
                    float z = position.z;
                    vec3 p = vec3(x,y,z);
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
                `,
            fragmentshader: ` 
                precision highp float;
                uniform float u_opacity;
                uniform vec3 color;
                varying float innerAlpha;
                void main() {
                    float red = color.x;
                    float green = color.y;
                    float blue = color.z;
                    float redr = color.x/255.0;
                    float greenr = color.y/255.0;
                    float bluer = color.z/255.0;
                    vec3 cr = vec3(redr+red*innerAlpha,greenr+green*innerAlpha,bluer+blue*innerAlpha);
                    vec4 u_color = vec4(cr,min(1.0,0.2+u_opacity));
                    gl_FragColor = u_color;
                }`
        }
        this.outerpolygon = {
            vertexshader: ` 
                void main() {
                    float x = position.x;
                    float y = position.y;
                    float z = position.z;
                    vec3 p = vec3(x,y,z);
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
                `,
            fragmentshader: ` 
                uniform float u_opacity;
                uniform vec3 color;
                void main() {
                    vec4 u_color = vec4(color,min(1.0,u_opacity));
                    gl_FragColor = u_color;
                }`
        }
        this.init()
    }

    _handlePosition(position) {
        const p = position
        const boxposition = this.tb.utils.lnglatsToWorld(p)
        return boxposition
    }

    init() {
        // 本体
        const box = this._addbox(this.color, this.position[0], this.height)
        this.container.push(box)
        const polygon = this.turf.polygon(this.position);
        // 皮肤遮罩
        if (this.needskin) {
            const buffered = this.turf.buffer(polygon, this.skinheight / 1000, { units: 'kilometers' });
            const bbox = buffered.geometry.coordinates[0]
            // 影响性能
            this._addbox(this.skincolor, bbox, this.height + this.skinheight)
        }
        // 计算外围包围盒
        if (this.needbbox) {
            const buffered = this.turf.buffer(polygon, this.distance, { units: 'kilometers' });
            const bbox = buffered.geometry.coordinates[0]
            const boxposition = this._handlePosition(bbox)
            this._addouterpolygon(boxposition)
        }
    }

    _addbox(color, position, height) {
        const colorArr = this.getColorArr(color);
        const shape = new THREE.Shape();
        const p = this._handlePosition(position)
        shape.moveTo(p[0].x, p[0].y);
        p.forEach((item, index) => {
            if (index > 0) {
                shape.lineTo(item.x, item.y);
            }
        });
        shape.moveTo(p[p.length - 1].x, p[p.length - 1].y);
        const extrudeSettings = {
            depth: height * 0.027484,
            bevelEnabled: false,
        };
        const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        const innermaterial = new this.THREE.ShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                u_opacity: { value: colorArr[1], type: "f" },
                height: { value: height * 0.027484, type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.boxShader.vertexshader,
            fragmentShader: this.boxShader.fragmentshader,
        });
        const mesh = new THREE.Mesh(geometry, innermaterial);
        this.container.push(mesh)
        return mesh

    }

    _addouterpolygon(position) {
        const outercolor = this.getColorArr(this.outercolor);
        const shape = new THREE.Shape();
        shape.moveTo(position[0].x, position[0].y);
        position.forEach((item, index) => {
            if (index > 0) {
                shape.lineTo(item.x, item.y);
            }
        });
        shape.moveTo(position[position.length - 1].x, position[position.length - 1].y);
        const extrudeSettings = {
            depth: this.outerheight * 0.027484,
            bevelEnabled: false,
        };
        const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        const material = new this.THREE.ShaderMaterial({
            uniforms: {
                color: { value: outercolor[0], type: "v3" },
                u_opacity: { value: outercolor[1], type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.outerpolygon.vertexshader,
            fragmentShader: this.outerpolygon.fragmentshader,
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.outerbox = mesh
        this.container.push(mesh)
        return {
            outergeometry: geometry,
            color: outercolor[0]
        }
    }

    // 设置楼体颜色
    setColor(color) {
        const colorArr = this.getColorArr(color);
        this.container.forEach((item) => {
            if (item.geometry.uuid !== this.outerbox.geometry.uuid) {
                item.material.uniforms.color.value = colorArr[0];
            }
        })
    }

    // 设置包围盒颜色
    setOutBoxColor(color) {
        const colorArr = this.getColorArr(color);
        this.outerbox.material.uniforms.color.value = colorArr[0];
    }

    // 设置楼体透明度
    setAlpha(alpha) {
        this.box.material.uniforms.u_opacity.value = alpha;
    }

    // 设置包围盒透明度
    setOutBoxAlpha(alpha) {
        this.outerbox.material.uniforms.u_opacity.value = alpha;
    }

    // 删除
    remove() {
        this.container.forEach((item) => {
            try {
                this.tb.remove(item)
            } catch (e) { }
        })
        this.container = []
    }

    // rgb2uniform
    getColorArr(str) {
        if (Array.isArray(str)) return str;
        let arr = [];
        str += '';
        str = str.toLowerCase().replace(/\s/g, "");
        if (/^((?:rgba)?)\(\s*([^\)]*)/.test(str)) {
            arr = str.replace(/rgba\(|\)/gi, '').split(',');
            const hex = [
                HighLightBuilding.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                HighLightBuilding.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                HighLightBuilding.pad2(Math.round(arr[2] * 1 || 0).toString(16))
            ];
            arr[0] = this._color(`#${  hex.join("")}`);
            arr[1] = Math.max(0, Math.min(1, (arr[3] * 1 || 0)));
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
        return c.length == 1 ? `0${  c}` : `${  c}`;
    }
}

export { HighLightBuilding }