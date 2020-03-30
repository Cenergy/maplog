/* eslint-disable max-len */
import * as turf from '@turf/turf';
import HandlerBase from './handlerBase';
import { HasCoordinate } from '../../mixin';

import IdName from '../../idName';
import * as markerFun from '../../../utils/markerFun';
import * as flyLineFun from '../../../utils/flyLineFun';
import * as diffusionFun from '../../../utils/diffusionFun';

import ColorFormat from '../../../utils/colorFormat';

/**
 *  线的style ，包括线颜色，宽度，线可分点等
 *
 */
class LineStyle {
    constructor(options = {}) {
        const { color = '#10F80B', strokeWidth = 60, pointCount = 100, _isShow = true } = options;
        this._color = color;
        this._strokeWidth = strokeWidth;
        this.pointCount = pointCount;
        this._isShow = _isShow;
    }
}

/**
 *  用户的类 继承于IdName
 * type 用户类型
 * style，连线的样式
 * name 名字
 * avatar 头像
 */
class LinkUser extends IdName {
    constructor(options) {
        super(options);
        Object.assign(this, new HasCoordinate(options));
        const { type = 'common', style = {}, avatar, name = '佚名', job = '', phone = '' } = options;
        this.type = type;
        this.hasLink = false;
        this.lineStyle = new LineStyle(style);
        this.avatar = avatar;
        this.name = name;
        this.job = job;
        this.phone = phone;
    }
}

export default class LinkLinesHandler extends HandlerBase {
    constructor(option) {
        super(option);
        const { map } = option;
        this.map = map;
        const { dataService } = option;
        this._dataService = dataService;
        this.commonUser = [];
        this.hostUser = [];
    }

    _addCore(drawable) {
        const { users, mode } = drawable;
        const transformUsers = users.map(user => {
            return new LinkUser(user);
        });
        const defaultImg = `${this._dataService.baseUrl}commondata/mapRelated/infoBox.png`;
        const defaultMeshline = `${this._dataService.baseUrl}commondata/mapRelated/meshline.png`;

        const commonUser = transformUsers.filter(user => user.type === 'common');
        const hostUser = transformUsers.filter(user => user.type === 'host');

        if (!['calling', 'videoConference'].includes(mode)) return { marker: [], line: [], diffusion: [], users: { commonUser, hostUser } };

        if (transformUsers.length < 2) return { marker: [], line: [], diffusion: [], users: { commonUser, hostUser } };
        // 2个以上用户时，绘制载入框及相关信息，只绘制普通用户的
        let validUsers = commonUser;
        if (mode === 'calling') validUsers = transformUsers.slice(0, 2);
        const markerObj = validUsers.map(user => {
            user.hasLink = true;

            const marker = markerFun.addMarker({
                map: this.map,
                _imagePath: defaultImg,
                _width: 180,
                _height: 146,
                coordinate: user.coordinate,
                popupInfo: null,
                popupClassName: 'popupClassName',
                offset: [88, 0],
                title: markerFun.contextHTML(user),
            });
            marker.userType = user.type;
            return marker;
        });
        // 底下的环

        const userCoor = validUsers.map(user => turf.point(user.coordinate, { user: user.name || '' }));
        const userGeojson = turf.featureCollection(userCoor);
        const { _color: color } = transformUsers[0].lineStyle;
        // 全部会转成rgb的字符串
        const colorConvert = new ColorFormat({ color, format: 'rgb' }).complete || `0,254,255`;
        const diffusionSources = diffusionFun.addDiffusion({ data: userGeojson, map: this.map, rgb: colorConvert });

        if (mode === 'calling') {
            const flyLineStyle = validUsers[0].lineStyle;
            flyLineStyle.meshline = defaultMeshline;
            flyLineStyle.coordStart = validUsers[0].coordinate;
            flyLineStyle.coordEnd = validUsers[1].coordinate;
            const flyLine = flyLineFun.addFlyLine(flyLineStyle);

            const reverseFlyLineStyle = validUsers[1].lineStyle;
            reverseFlyLineStyle.meshline = defaultMeshline;
            reverseFlyLineStyle.coordStart = validUsers[1].coordinate;
            reverseFlyLineStyle.coordEnd = validUsers[0].coordinate;
            const reverseFlyLine = flyLineFun.addFlyLine(reverseFlyLineStyle);

            return {
                marker: markerObj,
                line: [flyLine, reverseFlyLine],
                diffusion: diffusionSources,
                users: { validUsers, hostUser },
            };
        }

        if (mode === 'videoConference') {
            // 当有2个及以上的多个用户时，意味着有一个为中心
            const lineList = commonUser.map(user => {
                const flyLineStyle = user.lineStyle;
                flyLineStyle.meshline = defaultMeshline;
                flyLineStyle.coordStart = user.coordinate;
                flyLineStyle.coordEnd = hostUser[0].coordinate;
                return flyLineFun.addFlyLine(flyLineStyle);
            });
            return { marker: markerObj, line: lineList, diffusion: diffusionSources, users: { commonUser, hostUser } };
        }
        return { marker: [], line: [], diffusion: [], users: { commonUser, hostUser } };
    }

    _updateCore(drawable) {
        const realDrawable = this._drawableRelation.get(drawable._id);
        console.log('Rd: LinkLinesHandler -> _updateCore -> realDrawable', realDrawable);
    }

    _removeCore(drawableID) {
        const realDrawable = this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            return;
        }
        const markerList = realDrawable.marker;
        if (markerList.length) {
            markerList.map(marker => marker.remove());
        }
        const lineList = realDrawable.line;
        if (lineList.length) {
            lineList.map(flyLine => flyLineFun.removeFlyLine(flyLine));
            this.map.repaint = true;
        }
        const { diffusion } = realDrawable;
        const layerID = diffusion.id;
        if (this.map.getLayer(layerID)) this.map.removeLayer(layerID);
    }

    _setVisibility(drawableID, visiable) {
        const realDrawable = this._drawableRelation.get(drawableID);
        if (!realDrawable) {
            return;
        }
        const markerList = realDrawable.marker;
        if (markerList.length) {
            markerList.map(marker => markerFun.setVisibility(marker, visiable));
        }
        const lineList = realDrawable.line;
        if (lineList.length) {
            lineList.map(flyLine => flyLineFun.setVisibility(flyLine, visiable));
            this.map.repaint = true;
        }
        const { diffusion } = realDrawable;
        if (diffusion) {
            const layerID = diffusion.id;
            if (this.map.getLayer(layerID)) {
                this.map.setLayoutProperty(layerID, 'visibility', visiable ? 'visible' : 'none');
            }
        }
    }
}
