function loadCssStyle(cssText) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.rel = 'stylesheet';
  const head = document.getElementsByTagName('head')[0];
  style.innerHTML = cssText;
  head.appendChild(style);
}
export default { loadCssStyle };
