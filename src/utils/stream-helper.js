import Logger from './logger';
import { PARTNERS, TRITON_URL, HLS_STREAM_URL, WFAN_STATION } from '../constants/main';
import API from '../data/api';
import { isMobileDevice } from './main';

export default class StreamHelper {
  async getFormattedStream(station, streamFormat) {
    const defaultStream = this.getDefaultStream(station, streamFormat);

    if (this.isTritonStream(defaultStream)) {
      const stationName = this.getStationName(defaultStream);
      const xmlData = await API.getMounts(stationName);
      const tritonStream = this.getTritonStream(xmlData, defaultStream);
      return this.appendTrackingParams(tritonStream, station.attributes.partner, false);
    }
    return this.appendTrackingParams(defaultStream, station.attributes.partner, true);
  }
  getDefaultStream(station, streamFormat) {
    const defaultStreamArray = station.attributes.station_stream;
    const defaultStream = defaultStreamArray.find(stream => stream.type === streamFormat);
    return defaultStream.url;
  }
  getTritonStream(xmlData, url) {
    const mountName = this.getMountName(url);
    const data = (new window.DOMParser()).parseFromString(xmlData, 'text/xml');
    const mountPoints = data.getElementsByTagName('mountpoint');
    let generated;

    for (let i = 0; i < mountPoints.length; i++) {
      const data2 = mountPoints[i];
      if (typeof data2.getElementsByTagName('mount')[0] !== 'undefined'
                    && data2.getElementsByTagName('mount')[0].childNodes[0].nodeValue === mountName) {
        const servers = data2.getElementsByTagName('server');

        generated = `https://${servers[0].getElementsByTagName('ip')[0].childNodes[0].nodeValue}/${mountName}`;
      }
    }

    Logger.log(`Generated ${generated}`);

    const streamGUID = this.getUUID();
    const result = `${generated}_SC?sbmid=${streamGUID}`;

    return result;
  }
  getUUID() { // Public Domain/MIT
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  getStationName(url) {
    const mountWithExtention = this.getMountWithExtention(url);
    const aac = 'AAC.aac';
    const mp3 = '.mp3';
    const mp3Dialup = 'DIALUP.mp3';
    const aacDialup = 'DIALUPAAC.aac';
    const aacADP = '_ADP.aac';

    // order of replace chaining functions matters!!!
    return mountWithExtention.replace(aacDialup, '').replace(aacADP, '').replace(aac, '').replace(mp3Dialup, '')
      .replace(mp3, '');
  }
  getMountWithExtention(url) {
    const indexLastSlash = url.lastIndexOf('/');
    return url.substring(indexLastSlash + 1, url.length);
  }
  getMountName(url) {
    const extension = this.getMountWithExtention(url);
    return extension.substring(0, extension.length - 4);
  }
  appendTrackingParams(url, partner, question) {
    let str = '?';
    if (!question) {
      str = '&';
    }

    switch (partner) {
      case PARTNERS.CBS:
        return `${url}${str}DIST=CBS&TGT=radiocomPlayer&SRC=CBS`;
      case PARTNERS.ETM:
        if (isMobileDevice()) {
          return `${url}${str}Source=radiocommobileweb`;
        }
        return `${url}${str}Source=radiocomPlayer`;
      default:
        return url;
    }
  }
  isTritonStream(url) {
    return (url.indexOf(TRITON_URL) > -1);
  }
  getSBMURL(url) {
    const streamURL = url.replace('_SC?', '_SBM?');
    const index = streamURL.indexOf('&');
    const SBMUrl = streamURL.substring(0, index);
    return SBMUrl;
  }
  getAiredStreamURL(timestamp, duration) {
    let streamURL = HLS_STREAM_URL.replace('<station>', WFAN_STATION);
    streamURL = streamURL.replace('<timestamp>', timestamp);
    streamURL = streamURL.replace('<duration>', duration);
    return streamURL;
  }
}
