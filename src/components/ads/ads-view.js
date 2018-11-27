import { COMPANION_AD_ID, DISPLAY_AD_CLASS, INNER_AD_ID, VIDEO_AD_ID, VIDEO_ELEMENT_ID, AD_IMAGE_ID } from '../../constants/ads';
import { isMobileDevice } from '../../utils/main';
import Logger from '../../utils/logger';
import { MIN_TABLET_WIDTH } from '../../constants/main';

export default class AdsView {
  constructor() {
    this.loadElements();
  }
  loadElements() {
    this.companionAd = document.getElementById(COMPANION_AD_ID);
    this.innerAd = document.getElementById(INNER_AD_ID);
    this.videoAd = document.getElementById(VIDEO_AD_ID);
    this.DFPImageAd = document.getElementById(AD_IMAGE_ID);
  }
  hideCompanionAd() {
    this.companionAd.classList.remove(DISPLAY_AD_CLASS);
  }
  showCompanionAd(adHtml) {
    this.innerAd.innerHTML = adHtml;
    this.companionAd.classList.add(DISPLAY_AD_CLASS);
  }
  showVideoAd() {
    this.videoAd.classList.add(DISPLAY_AD_CLASS);
  }
  hideVideoAd() {
    this.videoAd.classList.remove(DISPLAY_AD_CLASS);
  }
  createVideoElement() {
    const videoEl = document.createElement('video');
    videoEl.setAttribute('id', VIDEO_ELEMENT_ID);
    videoEl.setAttribute('data-account', '1418490336');
    videoEl.setAttribute('data-player', 'VaJw0BVkQ5');
    videoEl.setAttribute('data-embed', 'default');
    videoEl.setAttribute('data-application-id', '');
    videoEl.setAttribute('class', 'video-js');
    videoEl.setAttribute('controls', '');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('muted', '');

    const windowWidth = (window.outerWidth < 1) ? window.innerWidth : window.outerWidth;
    const windowHeight = (window.outerHeight < 1) ? window.innerHeight : window.outerHeight;

    if (isMobileDevice() && windowWidth < MIN_TABLET_WIDTH) {
      const padding = 10;
      videoEl.setAttribute('width', (windowWidth - (padding * 2)));
      videoEl.setAttribute('height', (windowHeight - (padding * 2)));
    } else {
      videoEl.setAttribute('width', '445');
      videoEl.setAttribute('height', '250');
    }
    this.videoAd.appendChild(videoEl);
    return videoEl;
  }
  createVideoPlayer(videoEl) {
    this.videoPlayer = bc(videoEl); // eslint-disable-line no-undef
    this.videoPlayer.addClass('vjs-ad-only');
    this.videoPlayer.adonly = true;
  }
  disposeVideoPlayer(self) {
    try {
      const videoEl = document.getElementById(VIDEO_ELEMENT_ID).getElementsByTagName('video')[0];
      videoEl.src = '';
      videoEl.load();
      self.videoPlayer.dispose();
    } catch (error) {
      Logger.error(error);
    }
  }
}
