import ZoomShowElement from '../../zoomShowElement';

export default class LayerBase extends ZoomShowElement {
    constructor(option) {
        super(option);
        const { analysisType = null, typeID = null, typeId = null } = option;
        this._typeId = typeID || typeId;
        this._option = option;
        this._analysisType = analysisType;
    }

    get typeId() {
        return this._typeId;
    }

    get analysisType() {
        return this._analysisType;
    }
}
