/* eslint-disable */

const INDENT = '    ';

function inlineRule(objRule) {
  let str = '';
  objRule &&
    Object.keys(objRule).forEach(rule => {
      str += `${rule}:${objRule[rule]};`;
    });
  return str;
}

function Stylize(styleFile) {
  function styleClass(cssClass) {
    return `class="${cssClass}"`;
  }

  function styleInline(cssClass) {
    return `style="${inlineRule(styleFile[`.${cssClass}`])}"`;
  }

  if (!styleFile) return styleClass;
  return styleInline;
}

function type(doc) {
  if (doc === null) return 'null';
  if (Array.isArray(doc)) return 'array';
  if (typeof doc === 'string' && /^https?:/.test(doc)) return 'link';
  if (typeof doc === 'object' && typeof doc.toISOString === 'function') return 'date';

  return typeof doc;
}

function escape(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function jsonMarkup(doc, styleFile) {
  let indent = '';
  const style = Stylize(styleFile);

  const forEach = function(list, start, end, fn) {
    if (!list.length) return `${start} ${end}`;

    let out = `${start}\n`;

    indent += INDENT;
    list.forEach((key, i) => {
      out += `${indent + fn(key) + (i < list.length - 1 ? ',' : '')}\n`;
    });
    indent = indent.slice(0, -INDENT.length);

    return out + indent + end;
  };

  function visit(obj) {
    if (obj === undefined) return '';

    switch (type(obj)) {
      case 'boolean':
        return `<span ${style('json-markup-bool')}>${obj}</span>`;

      case 'number':
        return `<span ${style('json-markup-number')}>${obj}</span>`;

      case 'date':
        return `<span class="json-markup-string">"${escape(obj.toISOString())}"</span>`;

      case 'null':
        return `<span ${style('json-markup-null')}>null</span>`;

      case 'string':
        return `<span ${style('json-markup-string')}>"${escape(
          obj.replace(/\n/g, `\n${indent}`),
        )}"</span>`;

      case 'link':
        return `<span ${style('json-markup-string')}>"<a href="${escape(obj)}">${escape(
          obj,
        )}</a>"</span>`;

      case 'array':
        return forEach(obj, '[', ']', visit);

      case 'object':
        var keys = Object.keys(obj).filter(key => obj[key] !== undefined);

        return forEach(
          keys,
          '{',
          '}',
          key => `<span ${style('json-markup-key')}>"${key}":</span> ${visit(obj[key])}`,
        );
    }

    return '';
  }

  return `<div ${style('json-markup')}>${visit(doc)}</div>`;
}

export default jsonObject => {
  return jsonMarkup(jsonObject, {
    '.json-markup': {
      'line-height': '17px',
      'font-size': '13px',
      'font-family': 'monospace',
      'white-space': 'pre',
    },
    '.json-markup-key': { 'font-weight': 'bold' },
    '.json-markup-bool': { color: 'firebrick' },
    '.json-markup-string': { color: 'lightgreen' },
    '.json-markup-null': { color: 'gray' },
    '.json-markup-number': { color: 'blue' },
  });
};
