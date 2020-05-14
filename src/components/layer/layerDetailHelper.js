import pointEntity from './layerPointEntity';
import detailService from '../../services/layerDataService0';

function _constructPointEntity(typeGroupKey, feature) {
    const { properties, geometry } = feature;
    const { id, Name, name, TypeID } = properties;
    const baseInfo = {
        id,
        name: Name || name,
        typeID: TypeID,
        lat: geometry.coordinates[0].toFixed(6),
        lng: geometry.coordinates[1].toFixed(6),
    };

    let entity;
    switch (typeGroupKey) {
        case 'camera':
            baseInfo.platform = properties.VideoPlatform;
            entity = new pointEntity.CameraMarker(baseInfo);
            break;
        case 'GPS':
            baseInfo.plugin = properties.Plugin;
            baseInfo.pluginName = properties.PluginName;
            baseInfo.number = properties.Number;
            entity = new pointEntity.GPSMarker(baseInfo);
            break;
        case 'phone':
            baseInfo.number = properties.Number;
            entity = new pointEntity.PhoneMarker(baseInfo);
            break;
        case 'facility':
            baseInfo.description = properties.description;
            baseInfo.extension = properties.Extension;
            entity = new pointEntity.FacilityMarker(baseInfo);
            break;
        case 'multiMediaTransfer':
            entity = new pointEntity.MultiMediaTransferMarker(baseInfo);
            break;
        default:
            entity = new pointEntity.PositionMarker(baseInfo);
    }
    return entity;
}

function getLayerPointDetail(typeGroupKey, feature) {
    const entity = _constructPointEntity(typeGroupKey, feature);
    const detailHtml = detailService.getMarkerDetailView(entity);
    return detailHtml;
}

export default {
    getLayerPointDetail,
};
