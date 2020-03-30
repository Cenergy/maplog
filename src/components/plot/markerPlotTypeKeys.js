function getUrl(key, color) {
    return `${key}/${key}_${color}.png`;
}

const markerPlotKeys = {
    CircleDrop: {
        Blue: getUrl('circleDrop', 'blue'),
        Green: getUrl('circleDrop', 'green'),
        LightBlue: getUrl('circleDrop', 'lightBlue'),
        Red: getUrl('circleDrop', 'red'),
        Yellow: getUrl('circleDrop', 'yellow'),
        Dark: getUrl('circleDrop', 'dark'),
    },
    Compass: {
        Blue: getUrl('compass', 'blue'),
        Green: getUrl('compass', 'green'),
        LightBlue: getUrl('compass', 'lightBlue'),
        Red: getUrl('compass', 'red'),
        Yellow: getUrl('compass', 'yellow'),
        Dark: getUrl('compass', 'dark'),
    },
    CrossDrop: {
        Blue: getUrl('crossDrop', 'blue'),
        Green: getUrl('crossDrop', 'green'),
        LightBlue: getUrl('crossDrop', 'lightBlue'),
        Red: getUrl('crossDrop', 'red'),
        Yellow: getUrl('crossDrop', 'yellow'),
        Dark: getUrl('crossDrop', 'dark'),
    },
    DoubleCircleDrop: {
        Blue: getUrl('doubleCircleDrop', 'blue'),
        Green: getUrl('doubleCircleDrop', 'green'),
        LightBlue: getUrl('doubleCircleDrop', 'lightBlue'),
        Red: getUrl('doubleCircleDrop', 'red'),
        Yellow: getUrl('doubleCircleDrop', 'yellow'),
        Dark: getUrl('doubleCircleDrop', 'dark'),
    },
    InvertedCone: {
        Blue: getUrl('invertedCone', 'blue'),
        Green: getUrl('invertedCone', 'green'),
        LightBlue: getUrl('invertedCone', 'lightBlue'),
        Red: getUrl('invertedCone', 'red'),
        Yellow: getUrl('invertedCone', 'yellow'),
        Dark: getUrl('invertedCone', 'dark'),
    },
    RectangleFlag: {
        Blue: getUrl('rectangleFlag', 'blue'),
        Green: getUrl('rectangleFlag', 'green'),
        Red: getUrl('rectangleFlag', 'red'),
        Yellow: getUrl('rectangleFlag', 'yellow'),
        Dark: getUrl('rectangleFlag', 'dark'),
    },
    Signal: {
        Blue: getUrl('signal', 'blue'),
        Green: getUrl('signal', 'green'),
        LightBlue: getUrl('signal', 'lightBlue'),
        Red: getUrl('signal', 'red'),
        Yellow: getUrl('signal', 'yellow'),
        Dark: getUrl('signal', 'dark'),
    },
    SimpleDrop: {
        Blue: getUrl('simpleDrop', 'blue'),
        Green: getUrl('simpleDrop', 'green'),
        LightBlue: getUrl('simpleDrop', 'lightBlue'),
        Red: getUrl('simpleDrop', 'red'),
        Yellow: getUrl('simpleDrop', 'yellow'),
        Dark: getUrl('simpleDrop', 'dark'),
    },
    TargetDrop: {
        Blue: getUrl('targetDrop', 'blue'),
        Green: getUrl('targetDrop', 'green'),
        LightBlue: getUrl('targetDrop', 'lightBlue'),
        Red: getUrl('targetDrop', 'red'),
        Yellow: getUrl('targetDrop', 'yellow'),
        Dark: getUrl('targetDrop', 'dark'),
    },
    TriangleFlag: {
        Blue: getUrl('triangleFlag', 'blue'),
        Green: getUrl('triangleFlag', 'green'),
        Red: getUrl('triangleFlag', 'red'),
        Yellow: getUrl('triangleFlag', 'yellow'),
    },
    WavingFlag: {
        Blue: getUrl('wavingFlag', 'blue'),
        Green: getUrl('wavingFlag', 'green'),
        Red: getUrl('wavingFlag', 'red'),
        Yellow: getUrl('wavingFlag', 'yellow'),
    },
};

export default markerPlotKeys;
