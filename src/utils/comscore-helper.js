export default class ComscoreHelper {
  static callComscore(genre) {
    const fullPageURL = window.location.href;
    window._comscore = window._comscore || []; // eslint-disable-line no-underscore-dangle
    window._comscore.push({ // eslint-disable-line no-underscore-dangle
      c1: '2', c2: '3005086', c4: fullPageURL, c5: genre,
    });
    const s = document.createElement('script');
    const el = document.getElementsByTagName('script')[0];
    s.async = true;
    s.src = `${document.location.protocol == 'https:' ? 'https://sb' : 'http://b'}.scorecardresearch.com/beacon.js`; // eslint-disable-line eqeqeq
    el.parentNode.insertBefore(s, el);
  }
}
