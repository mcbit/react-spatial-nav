import AdsView from './ads-view';
import API from '../../data/api';
import { SBM_CUE_POINT, SBM_AD } from '../../constants/station-details';
import { TINY_VIDEO_FOR_AD, VIDEO_AD_SERVER_URL } from '../../constants/main';
import Logger from '../../utils/logger';
import { AD_BLOCK_TIMEOUT, AD_END_EVENTS, AD_IMAGE_ID } from '../../constants/ads';

export default class AdsController {
  constructor(player) {
    this.player = player;
    this.dataModel = player.dataModel;
    this.view = new AdsView();
    this.playedStations = {};
    this.isAdPlaying = false;
    this.skipAds = false;
    // eslint-disable-next-line no-undef
    googletag.cmd.push(() => { googletag.display(AD_IMAGE_ID); });
  }
  updateCompanionAd(sbm) {
    const isAd = (sbm.type === SBM_CUE_POINT && sbm.name === SBM_AD);
    if (isAd) {
      let adURL = sbm.parameters.ad_url;
      const isAdURL = (adURL && adURL.trim() !== '');
      if (isAdURL) {
        Logger.log('updating companion ad');
        const self = this;
        if (adURL.startsWith('|')) {
          adURL = adURL.substring(1, adURL.length);
        }
        return API.getCompanionAd(adURL).then((adHtml) => {
          self.view.showCompanionAd(adHtml);
        });
      }
    } else {
      this.view.hideCompanionAd();
    }
  }
  playVideoAd() {
    if (!this.hasStationPlayed() && !this.skipAds && !this.player.isAdPlaying) {
      this.player.isAdPlaying = true;
      this.displayVideoAd();
      setTimeout(this.checkAdBlocked.bind(this), AD_BLOCK_TIMEOUT);
    }
  }
  displayVideoAd() {
    const self = this;
    const videoEl = this.view.createVideoElement();
    const videoAdURL = this.getVideoAdURL();
    this.view.createVideoPlayer(videoEl);
    this.view.videoPlayer.ima3({
      serverUrl: videoAdURL,
      ima3SdkSettings: {
        disableCustomPlaybackForIOS10Plus: true,
      },
      // debug: true,
      // sdkurl: '//imasdk.googleapis.com/js/sdkloader/ima3_debug.js'
    });
    this.view.videoPlayer.src(TINY_VIDEO_FOR_AD);
    this.view.videoPlayer.on(AD_END_EVENTS, () => {
      self.endVideoAd();
    });
    this.view.showVideoAd();
    this.view.videoPlayer.play();
  }
  checkAdBlocked() {
    if (!this.view.videoPlayer.ima3.isReady_) { // eslint-disable-line no-underscore-dangle
      this.endVideoAd();
    }
  }
  endVideoAd() {
    this.view.videoPlayer.pause();
    this.view.hideVideoAd();
    this.player.isAdPlaying = false;
    this.player.handleVideoAdEnd();
    setTimeout(this.view.disposeVideoPlayer, 200, this.view);
  }
  hasStationPlayed() {
    const { callsign } = this.dataModel.currentStation.attributes;
    if (!this.playedStations[callsign]) {
      this.playedStations[callsign] = true;
      return false;
    }
    return true;
  }
  getVideoAdURL() {
    let url = VIDEO_AD_SERVER_URL;
    // inject custom params
    const station = this.dataModel.currentStation;
    let callsign = station.attributes.callsign.toLowerCase();
    callsign = callsign.replace(/ /g, '');

    let marketName = station.attributes.market_name.toLowerCase();
    marketName = marketName.replace(/ /g, '');

    let genres = '';
    station.attributes.genre_name.forEach((g) => {
      genres += `${g},`;
    });
    genres = genres.substring(0, genres.length - 1);
    genres = genres.toLowerCase();
    genres = genres.replace(/ /g, '');


    const custParams = encodeURI(`tag=livestreamplayer,${callsign},${marketName},${genres}&player=livestreamplayer&station=${callsign}&market=${marketName}&genre=${genres}`);

    url = url.replace('[cust_params]', custParams);
    url = url.replace('[description_url]', window.location.href);
    url = url.replace('[referrer_url]', window.location.href);
    url = url.replace('[timestamp]', Date.now());
    return url;
  }
}
