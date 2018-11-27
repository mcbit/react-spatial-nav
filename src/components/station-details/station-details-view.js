import { STATION_NAME_CONTAINER_ID, STATION_NAME_WRAPPER_ID, STATION_NAME_ID, SHOW_NAME_CONTAINER_ID, SHOW_NAME_ID, SHOW_DESCRIPTION_CONTAINER_ID, SHOW_DESCRIPTION_ID, TITLE_ARTIST_CONTAINER_ID, TITLE_ARTIST_ID, MINIMIZED_STATION_CONTAINER_ID, MINIMIZED_STATION_ID, MINIMIZED_SHOW_CONTAINER_ID, MINIMIZED_SHOW_ID, MARQUEE_CLASS, POSTER_ID } from '../../constants/station-details';
import DateHelper from '../../utils/date-helper';
import MarqueeHelper from '../../utils/marquee-helper';

export default class StationDetailsView {
  constructor() {
    this.loadElements();
  }
  loadElements() {
    this.stationNameContainer = document.getElementById(STATION_NAME_CONTAINER_ID);
    this.stationNameWrapper = document.getElementById(STATION_NAME_WRAPPER_ID);
    this.stationName = document.getElementById(STATION_NAME_ID);
    this.showNameContainer = document.getElementById(SHOW_NAME_CONTAINER_ID);
    this.showName = document.getElementById(SHOW_NAME_ID);
    this.showDescriptionContainer = document.getElementById(SHOW_DESCRIPTION_CONTAINER_ID);
    this.showDescription = document.getElementById(SHOW_DESCRIPTION_ID);
    this.titleArtistContainer = document.getElementById(TITLE_ARTIST_CONTAINER_ID);
    this.titleArtist = document.getElementById(TITLE_ARTIST_ID);
    this.minimizedStationContainer = document.getElementById(MINIMIZED_STATION_CONTAINER_ID);
    this.minimizedStation = document.getElementById(MINIMIZED_STATION_ID);
    this.minimizedShowContainer = document.getElementById(MINIMIZED_SHOW_CONTAINER_ID);
    this.minimizedShow = document.getElementById(MINIMIZED_SHOW_ID);
    this.poster = document.getElementById(POSTER_ID);
  }
  reset() {
    this.resetElement(this.stationNameContainer, this.stationName);
    this.resetElement(this.showNameContainer, this.showName);
    this.resetElement(this.showDescriptionContainer, this.showDescription);
    this.resetElement(this.titleArtistContainer, this.titleArtist);
    this.resetElement(this.minimizedStationContainer, this.minimizedStation);
    this.resetElement(this.minimizedShowContainer, this.minimizedShow);
  }
  resetElement(container, text) {
    container.classList.remove(MARQUEE_CLASS);
    text.innerHTML = '';
  }
  updatePoster(imageURL) {
    this.poster.style.backgroundImage = `url('${imageURL}')`;
  }
  updateStationName(stationName) {
    this.stationName.innerHTML = stationName;
    this.minimizedStation.innerHTML = stationName;

    this.stationNameContainer.classList.remove(MARQUEE_CLASS);
    if (MarqueeHelper.isOverflown(this.stationNameWrapper)) {
      this.stationNameContainer.classList.add(MARQUEE_CLASS);
      MarqueeHelper.marqueeSpeedHelper(this.stationNameContainer, this.stationName);
    }

    MarqueeHelper.updateMinimizedMarquee();
  }
  updateShowName(nameOfShow) {
    this.updateTextContent(SHOW_NAME_ID, nameOfShow);
    this.updateTextContent(TITLE_ARTIST_ID, nameOfShow);
    this.minimizedShow.innerHTML = nameOfShow;
    MarqueeHelper.updateMinimizedMarquee();
  }
  updateShowDescription(showDescription, isMusic) {
    if (isMusic) {
      this.updateArtistName(showDescription);
    } else {
      this.updateStartEndTime(showDescription);
    }
  }
  updateArtistName(artistName) {
    this.updateTextContent(SHOW_DESCRIPTION_ID, artistName);
    const nameOfShow = this.showName.innerHTML;
    const content = (artistName) ? `${nameOfShow} - ${artistName}` : nameOfShow;
    this.updateTextContent(TITLE_ARTIST_ID, content);
    this.updateTextContent(MINIMIZED_SHOW_ID, content);
  }
  updateStartEndTime(currentShowData) {
    const dateHelper = new DateHelper();
    const showDescription = dateHelper.getStartEndString(
      currentShowData.startTimeUnix,
      currentShowData.endTimeUnix,
    );
    this.updateTextContent(SHOW_DESCRIPTION_ID, showDescription);
  }
  updateTextContent(element, content) {
    const el = document.getElementById(`${element}`);
    el.innerHTML = content;
    MarqueeHelper.updateMarquee(element);
  }
}
