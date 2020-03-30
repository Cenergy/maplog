import { Threebox, THREE } from '@rdapp/threebox';
import HandlerBase from './handlerBase';
import tbService from '../../../services/tbService';

// @ts-ignore
window.Threebox = Threebox;
// @ts-ignore
window.THREE = THREE;
class Elew {
    constructor({ delay, element, maxZ, offset, delayoffset, initZ }) {
        this.element = element;
        const { position } = this.element;
        position.z = initZ; // 初始高度
        this.delay = delay;
        this.maxZ = maxZ; // 最大高度
        this.offset = offset; // 每个框的高度间距
        this.topOffset = maxZ - offset; // 顶部高度偏移
        this.bottomOffset = initZ + offset; // 底部高度偏移
        this.initZ = initZ; // 初始高度
        this.delayoffset = delayoffset;
        this.element.material.opacity = 0;
    }

    tick() {
        if (this.delay > 0) {
            this.delay -= 1;
            return;
        }
        const { position } = this.element;
        position.z += this.offset / this.delayoffset;
        if (position.z > this.maxZ) {
            position.z = this.initZ;
            this.element.material.opacity = 0;
        } else if (position.z > this.topOffset) {
            this.element.material.opacity = (this.maxZ - position.z) / this.offset;
        } else if (position.z < this.bottomOffset) {
            this.element.material.opacity = (position.z - this.offset) / this.offset;
        }
    }
}

class TorusWapper {
    constructor(map, drawable) {
        this._map = map;
        this.drawable = drawable;
        this.cache = {
            coordinate: drawable.coordinate,
            isShow: drawable.isShow,
            isRemove: false,
        };
        this.hasDrawed = false;
        this._torusTemplate = null;
    }

    draw() {
        if (this.cache.isRemove) {
            return;
        }
        let delayCache = 0;
        const { delayoffset, initZ, maxZ, offset, color } = this.drawable;

        const group = new THREE.Group();
        group.rotation.z = Math.PI * (this.drawable.rotation / 180);

        for (let index = 1; index < 10; index += 1) {
            const geometry = new THREE.RingGeometry(1.6, 2.0, 4);
            const material = new THREE.MeshPhongMaterial({
                color,
                side: THREE.DoubleSide,
                transparent: true,
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.z = index * initZ;

            group.add(mesh);
        }

        this._torusTemplate = tbService.tb.Object3D({ obj: group }).setCoords(this.cache.coordinate);
        tbService.tb.add(this._torusTemplate);

        const eles = [];

        group.children.forEach(element => {
            eles.push(
                new Elew({
                    delay: delayCache,
                    element,
                    maxZ,
                    offset,
                    initZ,
                    delayoffset,
                })
            );
            delayCache += delayoffset;
        });
        this.hasDrawed = true;

        function animate() {
            eles.map(ele => ele.tick());
            requestAnimationFrame(animate.bind(this));
        }
        animate();
    }

    update() {
        const newCoordinate = this.drawable.coordinate;
        console.log('go: TorusWapper -> update -> newCoordinate', newCoordinate);
        if (!this.hasDrawed) {
            this.cache.coordinate = newCoordinate;
            return;
        }
        this._torusTemplate.setCoords(newCoordinate);
        this._map.repaint = true;
        this.cache.coordinate = newCoordinate;
    }

    remove() {
        if (!this.hasDrawed) {
            this.cache.isRemove = true;
            return;
        }
        tbService.tb.remove(this._torusTemplate);
        this._map.repaint = true;
    }

    toggleShow(isShow) {
        if (!this.hasDrawed) {
            this.cache.isShow = isShow;
            return;
        }
        this._torusTemplate.visible = isShow;

        this._map.repaint = true;
    }
}

export default class TorusHandler extends HandlerBase {
    _addCore(drawable) {
        console.log('go: ThreeJsModelHandler -> _addCore -> drawable', drawable);
        const wrapper = new TorusWapper(this._map, drawable);
        wrapper.draw();
        return wrapper;
    }

    async _updateCore(drawable) {
        const wrapper = this._drawableRelation.get(drawable._id);
        if (wrapper) {
            wrapper.update();
        }
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            return;
        }
        realDrawable.remove();
    }

    async _setVisibility(drawableID, visiable) {
        const wrapper = this._drawableRelation.get(drawableID);
        if (wrapper) {
            wrapper.toggleShow(visiable);
        }
    }
}
