import { tns } from 'tiny-slider/src/tiny-slider';
import { TIMELINE_CONTAINER_ID, TIMELINE_SHOW_CLASS, TIMELINE_SHOW_DETAILS_CLASS, TIMELINE_SHOW_NAME_CLASS, TIMELINE_SHOW_START_TIME_CLASS, TIMEFRAME_TOTAL_LENGTH, TIMELINE_BORDER_OFFSET, TIMELINE_CAROUSEL_ID, TIMELINE_CAROUSEL_CELL_CLASS, TIMELINE_NEXT_BUTTON_ID, TIMELINE_PREV_BUTTON_ID, TIMELINE_CAROUSEL_CLASS, TIMELINE_CAROUSEL_DIRECTION, TIMELINE_SHOW_TYPE, TIMELINE_SHOW_BUTTON_CLASS, TIMELINE_BUTTON_STOP_CLASS, TIMELINE_SHOW_TIME_INFO, TIMELINE_SHOW_TIME_CLASS, TIMELINE_SHOW_NAME_TIME_CLASS, TIMELINE_SHOW_TIME_LIVE_CLASS, TIMELINE_SHOW_LIVE_TEXT_CLASS, TIMELINE_SHOW_LIVE_INDICATOR_CLASS, TIMELINE_SHOW_BUTTON_CONTAINER_CLASS, TIMELINE_LOADING_SPINNER_CLASS, TIMELINE_BUTTON_LOADING_CLASS } from '../../constants/timeline';
import { IS_EDGE } from '../../constants/main';
import DateHelper from '../../utils/date-helper';

export default class TimelineView {
  constructor() {
    this.loadElements();
  }
  loadElements() {
    this.container = document.getElementById(TIMELINE_CONTAINER_ID);
    this.carousel = document.getElementById(TIMELINE_CAROUSEL_ID);
    this.nextButton = document.getElementById(TIMELINE_NEXT_BUTTON_ID);
    this.prevButton = document.getElementById(TIMELINE_PREV_BUTTON_ID);
  }
  createShow(showData) {
    const show = document.createElement('div');
    show.classList.add(TIMELINE_SHOW_CLASS);
    showData.classList.forEach((className) => {
      show.classList.add(className);
    });

    show.appendChild(this.createShowStartTime(showData));
    show.appendChild(this.createShowDetails(showData));

    const offset = (IS_EDGE) ? (TIMELINE_BORDER_OFFSET + 1) : TIMELINE_BORDER_OFFSET;
    show.style.width = `calc(${(showData.length / TIMEFRAME_TOTAL_LENGTH) * 100}% - ${offset}px)`;
    show.dataset.index = showData.index;
    show.dataset.startTimeUnix = showData.startTimeUnix;
    show.dataset.endTimeUnix = showData.endTimeUnix;

    return show;
  }
  createShowStartTime(showData) {
    const showStartTime = document.createElement('div');
    showStartTime.classList.add(TIMELINE_SHOW_START_TIME_CLASS);
    showStartTime.innerHTML = showData.startTime;
    return showStartTime;
  }
  createShowDetails(showData) {
    const showDetails = document.createElement('div');
    showDetails.classList.add(TIMELINE_SHOW_DETAILS_CLASS);
    if (!showData.classList.includes(TIMELINE_SHOW_TYPE.upcoming)) {
      showDetails.appendChild(this.createShowButton());
    }
    showDetails.appendChild(this.createShowNameTime(showData));
    return showDetails;
  }
  createShowButton() {
    const showButtonContainer = document.createElement('div');
    showButtonContainer.classList.add(TIMELINE_SHOW_BUTTON_CONTAINER_CLASS);
    const showButton = document.createElement('div');
    showButton.classList.add(TIMELINE_SHOW_BUTTON_CLASS);
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add(TIMELINE_LOADING_SPINNER_CLASS);
    showButtonContainer.appendChild(showButton);
    showButtonContainer.appendChild(loadingSpinner);
    return showButtonContainer;
  }
  createShowNameTime(showData) {
    const showNameTime = document.createElement('div');
    showNameTime.classList.add(TIMELINE_SHOW_NAME_TIME_CLASS);

    if (!showData.classList.includes(TIMELINE_SHOW_TYPE.live)) {
      showNameTime.appendChild(this.createShowTime(showData));
    } else {
      showNameTime.appendChild(this.createShowTimeLive(showData));
    }
    showNameTime.appendChild(this.createShowName(showData));
    return showNameTime;
  }
  createShowName(showData) {
    const showName = document.createElement('div');
    showName.classList.add(TIMELINE_SHOW_NAME_CLASS);
    showName.innerHTML = showData.name;
    return showName;
  }
  createShowTimeLive(showData) {
    const showTimeLive = document.createElement('div');
    showTimeLive.classList.add(TIMELINE_SHOW_TIME_LIVE_CLASS);
    showTimeLive.appendChild(this.createShowLiveIndicator());
    showTimeLive.appendChild(this.createShowLiveText(showData));
    return showTimeLive;
  }
  createShowLiveText(showData) {
    const showLiveText = document.createElement('div');
    showLiveText.classList.add(TIMELINE_SHOW_LIVE_TEXT_CLASS);
    showLiveText.innerHTML = this.getShowTimeInfo(
      showData.classList,
      showData.startTimeUnix,
      showData.endTimeUnix,
    );
    return showLiveText;
  }
  createShowLiveIndicator() {
    const showLiveIndicator = document.createElement('div');
    showLiveIndicator.classList.add(TIMELINE_SHOW_LIVE_INDICATOR_CLASS);
    return showLiveIndicator;
  }
  createShowTime(showData) {
    const showTime = document.createElement('div');
    showTime.classList.add(TIMELINE_SHOW_TIME_CLASS);
    showTime.innerHTML = this.getShowTimeInfo(
      showData.classList,
      showData.startTimeUnix,
      showData.endTimeUnix,
    );
    return showTime;
  }
  getShowTimeInfo(showClassList, startTimeUnix, endTimeUnix) {
    if (showClassList.includes(TIMELINE_SHOW_TYPE.previous)) {
      if (showClassList.includes(TIMELINE_SHOW_TYPE.current)) {
        return TIMELINE_SHOW_TIME_INFO.currentlyPlaying;
      }
      const dateHelper = new DateHelper();
      return dateHelper.getStartEndString(startTimeUnix, endTimeUnix);
    } else if (showClassList.includes(TIMELINE_SHOW_TYPE.live)) {
      if (showClassList.includes(TIMELINE_SHOW_TYPE.current)) {
        return TIMELINE_SHOW_TIME_INFO.listeningLive;
      }
      return TIMELINE_SHOW_TIME_INFO.liveOnAir;
    } else if (showClassList.includes(TIMELINE_SHOW_TYPE.upcoming)) {
      return TIMELINE_SHOW_TIME_INFO.upcoming;
    }
  }
  addCarouselCell(shows) {
    const cell = document.createElement('div');
    cell.classList.add(TIMELINE_CAROUSEL_CELL_CLASS);
    shows.forEach((show) => {
      cell.appendChild(show);
    });
    this.cells.push(cell);
    this.carousel.appendChild(cell);
  }
  clear() {
    this.cells = [];
    this.carousel.innerHTML = '';
  }
  loadCarouselController() {
    this.carouselController = tns({
      container: TIMELINE_CAROUSEL_CLASS,
      items: 1,
      slideBy: 'page',
      autoplay: false,
      loop: false,
    });
  }
  update(event) {
    if (event) {
      const button = this.getTimelineButton(event);
      const direction = (button === this.nextButton) ?
        TIMELINE_CAROUSEL_DIRECTION.next : TIMELINE_CAROUSEL_DIRECTION.prev;
      this.carouselController.goTo(direction);
      this.toggleButton(event);
    } else {
      this.carouselController.goTo(TIMELINE_CAROUSEL_DIRECTION.default);
    }
  }
  toggleButton(event) {
    const button = this.getTimelineButton(event);
    const currentIndex = this.carouselController.getInfo().index;
    if (button === this.nextButton) {
      if (currentIndex < this.cells.length - 1) {
        button.style.opacity = 1;
        button.style.cursor = 'pointer';
      } else {
        button.style.opacity = 0;
        button.style.cursor = 'default';
      }
    } else if (currentIndex > 0) {
      button.style.opacity = 1;
      button.style.cursor = 'pointer';
    } else {
      button.style.opacity = 0;
      button.style.cursor = 'default';
    }
  }
  hideButton(event) {
    const button = this.getTimelineButton(event);
    button.style.opacity = 0;
    button.style.cursor = 'default';
  }
  setCurrentShow(currentShowIndex) {
    const self = this;
    const showContainers = Array.from(document
      .getElementsByClassName(TIMELINE_SHOW_CLASS));
    showContainers.forEach((showContainer) => {
      if (this.getShowIndex(showContainer) === currentShowIndex &&
        !showContainer.classList.contains(TIMELINE_SHOW_TYPE.upcoming)) {
        showContainer.classList.add(TIMELINE_SHOW_TYPE.current);
        self.updateShowTime(showContainer);
      }
    });
  }
  unsetCurrentShow() {
    const self = this;
    const currentShowContainers = Array.from(document
      .getElementsByClassName(TIMELINE_SHOW_TYPE.current));
    currentShowContainers.forEach((currentShowContainer) => {
      currentShowContainer.classList.remove(TIMELINE_SHOW_TYPE.current);
      self.updateShowTime(currentShowContainer);
    });
  }
  updateShowTime(show) {
    let showTime;
    if (show.classList.contains(TIMELINE_SHOW_TYPE.live)) {
      showTime = show.getElementsByClassName(TIMELINE_SHOW_LIVE_TEXT_CLASS)[0];
    } else {
      showTime = show.getElementsByClassName(TIMELINE_SHOW_TIME_CLASS)[0];
    }
    const showClassList = Array.from(show.classList);
    showTime.innerHTML = this.getShowTimeInfo(
      showClassList,
      show.dataset.startTimeUnix,
      show.dataset.endTimeUnix,
    );
  }
  showPauseButtons() {
    const currentShowContainers = Array.from(document
      .getElementsByClassName(TIMELINE_SHOW_TYPE.current));
    currentShowContainers.forEach((currentShowContainer) => {
      const showButton = currentShowContainer.getElementsByClassName(TIMELINE_SHOW_BUTTON_CLASS)[0];
      showButton.classList.add(TIMELINE_BUTTON_STOP_CLASS);
    });
  }
  showPlayButtons() {
    const currentShowContainers = Array.from(document
      .getElementsByClassName(TIMELINE_SHOW_TYPE.current));
    currentShowContainers.forEach((currentShowContainer) => {
      const showButton = currentShowContainer
        .getElementsByClassName(TIMELINE_SHOW_BUTTON_CLASS)[0];
      showButton.classList.remove(TIMELINE_BUTTON_STOP_CLASS);
    });
  }
  startLoadingSpinners(selectedShowIndex) {
    const showContainers = Array.from(document
      .getElementsByClassName(TIMELINE_SHOW_CLASS));
    showContainers.forEach((showContainer) => {
      if (this.getShowIndex(showContainer) === selectedShowIndex &&
        !showContainer.classList.contains(TIMELINE_SHOW_TYPE.upcoming)) {
        const showButtonContainer = showContainer
          .getElementsByClassName(TIMELINE_SHOW_BUTTON_CONTAINER_CLASS)[0];
        showButtonContainer.classList.add(TIMELINE_BUTTON_LOADING_CLASS);
      }
    });
  }
  stopLoadingSpinners() {
    const currentShowContainers = Array.from(document
      .getElementsByClassName(TIMELINE_SHOW_TYPE.current));
    currentShowContainers.forEach((currentShowContainer) => {
      const showButtonContainer = currentShowContainer
        .getElementsByClassName(TIMELINE_SHOW_BUTTON_CONTAINER_CLASS)[0];
      showButtonContainer.classList.remove(TIMELINE_BUTTON_LOADING_CLASS);
    });
  }
  getShowIndex(show) {
    const indexString = show.dataset.index;
    return (indexString === 'undefined') ? undefined : parseInt(indexString, 10);
  }
  getTimelineButton(event) {
    let button = event.target || event.srcElement;
    if (button !== this.nextButton && button !== this.prevButton) {
      button = button.parentElement;
    }
    return button;
  }
  isShowPlaying(button) {
    return button.classList.contains(TIMELINE_BUTTON_STOP_CLASS);
  }
}
