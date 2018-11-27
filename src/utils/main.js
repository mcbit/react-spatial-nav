export const isMobileDevice = () => {
  if (/Mobi|Android/i.test(window.navigator.userAgent)) {
    return true;
  }

  return false;
};

export const checkIfIE = () => {
  const { userAgent } = window.navigator;
  const msie = userAgent.indexOf('MSIE ');

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) { // eslint-disable-line no-useless-escape
    return true;
  }

  return false;
};

export const offsetOfElement = (el) => {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};

export const getCopy = obj => JSON.parse(JSON.stringify(obj));
