import { RADIO_PLAYER_CONTAINER_ID, MINIMIZED_CLASS } from '../constants/template';
import { SHOW_NAME_WRAPPER_ID, SHOW_NAME_ID, SHOW_NAME_CONTAINER_ID, STATION_NAME_WRAPPER_ID, STATION_NAME_CONTAINER_ID, STATION_NAME_ID, SHOW_DESCRIPTION_WRAPPER_ID, SHOW_DESCRIPTION_CONTAINER_ID, SHOW_DESCRIPTION_ID, TITLE_ARTIST_WRAPPER_ID, TITLE_ARTIST_CONTAINER_ID, TITLE_ARTIST_ID, MARQUEE_CLASS, MINIMIZED_STATION_ID, MINIMIZED_SHOW_ID } from '../constants/station-details';
import { MOBILE_MAX_WIDTH, MARQUEE_SPEED } from '../constants/main';

export default class MarqueeHelper {
  static isOverflown(element) {
    return element.scrollWidth > (element.clientWidth + 1);
  }
  static resizeHelper(container, wrapper, content) {
    const wrapperWidth = parseInt(window.getComputedStyle(wrapper, null).getPropertyValue('width'), 10);
    const nameWidth = parseInt(window.getComputedStyle(content, null).getPropertyValue('width'), 10);

    if (nameWidth < wrapperWidth && container.className.indexOf(MARQUEE_CLASS) > -1) {
      container.classList.remove(MARQUEE_CLASS);
    } else if (nameWidth > wrapperWidth && container.className.indexOf(MARQUEE_CLASS) === -1) {
      container.classList.add(MARQUEE_CLASS);
    }
  }
  static marqueeSpeedHelper(container, content) {
    const nameWidth = parseInt(window.getComputedStyle(content, null).getPropertyValue('width'), 10);

    if (container.className.indexOf('marquee') > -1) {
      content.style.animationDuration = `${nameWidth / MARQUEE_SPEED}s`;
    }
  }
  static updateMinimizedMarquee() {
    this.updateMarquee(MINIMIZED_STATION_ID);
    this.updateMarquee(MINIMIZED_SHOW_ID);
  }
  static updateMarquee(element) {
    const container = document.getElementById(`${element}Container`);
    const wrapper = document.getElementById(`${element}Wrapper`);
    const el = document.getElementById(`${element}`);
    container.classList.remove(MARQUEE_CLASS);

    if (this.isOverflown(wrapper)) {
      container.classList.add(MARQUEE_CLASS);
      this.marqueeSpeedHelper(container, el);
    }
  }
  static handleWindowResize() {
    const showNameWrapper = document.getElementById(SHOW_NAME_WRAPPER_ID);
    const showName = document.getElementById(SHOW_NAME_ID);
    const showNameContainer = document.getElementById(SHOW_NAME_CONTAINER_ID);

    const stationNameWrapper = document.getElementById(STATION_NAME_WRAPPER_ID);
    const stationNameContainer = document.getElementById(STATION_NAME_CONTAINER_ID);
    const stationName = document.getElementById(STATION_NAME_ID);

    const showDescriptionWrapper = document.getElementById(SHOW_DESCRIPTION_WRAPPER_ID);
    const showDescriptionContainer = document.getElementById(SHOW_DESCRIPTION_CONTAINER_ID);
    const showDescription = document.getElementById(SHOW_DESCRIPTION_ID);

    const titleArtistWrapper = document.getElementById(TITLE_ARTIST_WRAPPER_ID);
    const titleArtistContainer = document.getElementById(TITLE_ARTIST_CONTAINER_ID);
    const titleArtist = document.getElementById(TITLE_ARTIST_ID);

    this.resizeHelper(showNameContainer, showNameWrapper, showName);
    this.resizeHelper(stationNameContainer, stationNameWrapper, stationName);
    this.resizeHelper(showDescriptionContainer, showDescriptionWrapper, showDescription);
    this.resizeHelper(titleArtistContainer, titleArtistWrapper, titleArtist);

    this.marqueeSpeedHelper(showNameContainer, showName);
    this.marqueeSpeedHelper(stationNameContainer, stationName);
    this.marqueeSpeedHelper(showDescriptionContainer, showDescription);
    this.marqueeSpeedHelper(titleArtistContainer, titleArtist);

    // Switch from minimized view to mobile view when browser window shrinks past a certain width
    const radioPlayerContainer = document.getElementById(RADIO_PLAYER_CONTAINER_ID);

    if (window.outerWidth < MOBILE_MAX_WIDTH
        && radioPlayerContainer.classList.contains(MINIMIZED_CLASS)) {
      window.RadioPlayer.template.toggleMinimize();
    }
  }
}
