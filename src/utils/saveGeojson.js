/**
 * Creates a GeoJSON file from a GeoJSON object
 *
 * @name saveGeoJSONFile
 * @param {string} name FileName
 * @param {Object} data GeoJSON object
 * @returns {void}
 * @example
 * saveGeoJSONFile('streetLine.json',object);
 */
function saveGeoJSONFile(name, data) {
  const urlObject = window.URL || window.webkitURL || window;
  const exportBlob = new Blob([data]);
  const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
  saveLink.href = urlObject.createObjectURL(exportBlob);
  saveLink.download = name;
  const ev = document.createEvent('MouseEvents');
  ev.initMouseEvent(
    'click',
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
  );
  saveLink.dispatchEvent(ev);
}

function saveGeojson(fileName, jsonData) {
  saveGeoJSONFile(`${fileName}.json`, JSON.stringify(jsonData));
}

// function saveSelectedDraw() {
//  var d = new Date();
//  saveGeoJSONFile(d.getTime() + '_selected.json', JSON.stringify(Draw.getSelected()));
// }

// function saveAllSelectedDraw() {
//  var d = new Date();
//  saveGeoJSONFile(d.getTime() + '_all.json', JSON.stringify(Draw.getAll()));
// }

export default { saveGeojson };
