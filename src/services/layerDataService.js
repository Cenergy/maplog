function getMarkerDetailView(positionMarker) {
  console.log('rd: getMarkerDetailView -> positionMarker', positionMarker);
  return `<h1>${positionMarker._name}</h1>`;
}

async function requestLayerSource() {
  return {
    layers: [
      {
        name: '摄像头',
        typeGroupKey: 'camera',
        typeID: '121000100000',
      },
      {
        name: '电话',
        typeGroupKey: 'phone',
        typeID: '404000100000',
      },
      {
        name: '拍传',
        typeGroupKey: 'multiMediaTransfer',
        typeID: '212000100000',
      },
      {
        name: '危险源',
        typeGroupKey: 'facility',
        typeID: '406000100007',
      },
      {
        name: '污染源',
        typeGroupKey: 'facility',
        typeID: '406000100010',
      },
      {
        name: '仓库',
        typeGroupKey: 'facility',
        typeID: '406000100052',
      },
      {
        name: '避难场所',
        typeGroupKey: 'facility',
        typeID: '406000100002',
      },
      {
        name: '党政机关',
        typeGroupKey: 'facility',
        typeID: '406000100016',
      },
      {
        name: '学校',
        typeGroupKey: 'facility',
        typeID: '406000100005',
      },
      {
        name: '公园',
        typeGroupKey: 'facility',
        typeID: '406000100001',
      },
      {
        name: '调度用户',
        typeGroupKey: 'GPS',
        typeID: '401000100000',
      },
      {
        name: 'GPS插件1',
        typeGroupKey: 'GPS',
        typeID: '401000100001',
      },
      {
        name: 'GPS插件2',
        typeGroupKey: 'GPS',
        typeID: '401000100002',
      },
    ],
    dataUrls: [
      {
        name: 'camera',
        url: 'camera.json',
      },
      {
        name: 'phone',
        url: 'phone.json',
      },
      {
        name: 'goods',
        url: 'goods.geojson',
      },
      {
        name: 'facility',
        url: 'facilities.geojson',
      },
      {
        name: 'GPS',
        url: 'GPS.json',
      },
      // {
      //   name: 'multiMediaTransfer',
      //   url: 'muitiMediaTransferRecord.json',
      // },
    ],
  };
}

export default { getMarkerDetailView, requestLayerSource };
