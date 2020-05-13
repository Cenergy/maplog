/* eslint-disable max-classes-per-file */
class SpriteImageWrapper {
    constructor(options) {
        const { canvas, image, row = 1, column = 1 } = options;
        const { width } = canvas;
        const { height } = canvas;
        this.context = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.image = image;

        this.row = row;
        this.column = column;

        this.frameRowIndex = Math.floor(Math.random() * row);
        this.frameColIndex = Math.floor(Math.random() * column);
        this.gridWidth = image.width / column;
        this.gridHeight = image.height / row;
    }

    update() {
        this.frameColIndex += 1;
        if (this.frameColIndex >= this.column) {
            this.frameColIndex = 0;
            this.frameRowIndex += 1;
        }
        if (this.frameRowIndex >= this.row) {
            this.frameRowIndex = 0;
        }
    }

    render() {
        // Draw the animation
        const width = this.gridWidth;
        const height = this.gridHeight;
        const sx = this.frameColIndex * width;
        const sy = this.frameRowIndex * height;
        this.context.drawImage(this.image, sx, sy, width, height, 0, 0, this.width, this.height);
    }
}

export default class SpriteImage {
    constructor(options) {
        const { map, size = 100, img, row = 1, column = 1 } = options;
        this.width = size;
        this.img = img;
        this.row = row;
        this.column = column;
        this.height = size;
        this.map = map;
        this.data = new Uint8Array(size * size * 4);
        this.sprite = null;
    }

    onAdd() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
        const image = new Image();
        image.onload = () => {
            const sprite = new SpriteImageWrapper({
                canvas,
                image,
                numberOfFrames: 10,
                ticksPerFrame: 0,
                row: this.row,
                column: this.column,
                x: 0,
                y: 0,
            });
            this.sprite = sprite;
            this.map.triggerRepaint();
        };
        image.src = this.img;
        this.image = image;
    }

    render() {
        const { context } = this;
        context.clearRect(0, 0, this.width, this.height);
        if (this.sprite) {
            this.sprite.update();
            this.sprite.render();
        }
        this.data = context.getImageData(0, 0, this.width, this.height).data;
        this.map.triggerRepaint();
        return true;
    }
}
