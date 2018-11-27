import TimelineView from './timeline-view';
import DateHelper from '../../utils/date-helper';
import { TIMEFRAME_TOTAL_LENGTH, TIMEFRAME_NEXT_SHOW_LENGTH, TIMELINE_SHOW_CLASS, TIMELINE_SHOW_TYPE, TIMELINE_SHOW_BUTTON_CLASS } from '../../constants/timeline';
import { getCopy } from '../../utils/main';

export default class TimelineController {
  constructor(player) {
    this.player = player;
    this.dataModel = player.dataModel;
    this.view = new TimelineView();
    this.dateHelper = new DateHelper();
    this.timelineList = undefined;
    this.currentShowIndex = undefined;
    this.loadEvents();
  }
  loadEvents() {
    this.view.nextButton.addEventListener('click', this.view.update.bind(this.view));
    this.view.prevButton.addEventListener('click', this.view.update.bind(this.view));
    this.view.nextButton.addEventListener('mouseenter', this.view.toggleButton.bind(this.view));
    this.view.prevButton.addEventListener('mouseenter', this.view.toggleButton.bind(this.view));
    this.view.nextButton.addEventListener('mouseleave', this.view.hideButton.bind(this.view));
    this.view.prevButton.addEventListener('mouseleave', this.view.hideButton.bind(this.view));
  }
  load() {
    this.view.clear();
    if (!this.dataModel.isInteractivePlayer()) {
      return;
    }
    const self = this;
    this.setTimelineList();
    this.timelineList.reverse().forEach((timeframe) => {
      const shows = [];
      timeframe.forEach((showSection) => {
        const show = self.view.createShow(showSection.data);
        shows.push(show);
        if (!showSection.data.classList.includes(TIMELINE_SHOW_TYPE.upcoming)) {
          show.addEventListener('click', self.handleShowToggle.bind(self));
        }
      });
      self.view.addCarouselCell(shows);
    });
    this.view.loadCarouselController();
    this.view.update();
  }
  setTimelineList() {
    this.timelineList = [];
    const shows = this.getShows();
    let nextShow = this.dataModel.currentStation.shows.upcomingShow;

    while (nextShow) {
      let timeframe = this.getTimeframe(shows, nextShow);
      nextShow = timeframe[0].show;
      if (!nextShow) {
        if (timeframe.length > 1) {
          timeframe = this.resolveLimitedTimeframe();
          this.timelineList.push(timeframe);
        }
      } else {
        this.timelineList.push(timeframe);
      }
    }
  }
  resolveLimitedTimeframe() {
    const shows = this.getShows();
    const timeframe = [];
    let timelength = TIMEFRAME_TOTAL_LENGTH;
    while (timelength > 0) {
      const show = shows.shift();
      if (!show) {
        return timeframe;
      }
      if (timelength <= show.length) {
        timeframe.push(this.getShowSection(show, timelength));
        timelength = 0;
      } else if (timelength > show.length) {
        timeframe.push(this.getShowSection(show, show.length));
        timelength -= show.length;
      }
    }
    return timeframe;
  }
  getTimeframe(shows, nextShow) {
    const timeframe = [];
    let timelength = this.getRemainingTimelength(timeframe, nextShow);

    while (timelength > 0) {
      const show = shows.pop();
      if (!show) {
        timeframe.push(this.getShowSection(undefined));
        timelength = 0;
      } else if (timelength <= show.length) {
        timeframe.push(this.getShowSection(show, timelength));
        show.remaining = show.length - timelength;
        timelength = 0;
      } else if (timelength > show.length) {
        timeframe.push(this.getShowSection(show, show.length));
        timelength -= show.length;
        show.remaining = 0;
      }
    }
    return timeframe.reverse();
  }
  getRemainingTimelength(timeframe, nextShow) {
    let timelength = TIMEFRAME_TOTAL_LENGTH;
    if (nextShow.remaining < timelength) {
      const length = (nextShow.remaining + TIMEFRAME_NEXT_SHOW_LENGTH);
      timeframe.push(this.getShowSection(nextShow, length));
      timelength -= length;
      nextShow.remaining = 0;
    } else {
      timeframe.push(this.getShowSection(nextShow, timelength));
      timelength = 0;
      if (nextShow.remaining) {
        nextShow.remaining -= TIMEFRAME_TOTAL_LENGTH;
      } else {
        nextShow.remaining = nextShow.length - TIMEFRAME_TOTAL_LENGTH;
      }
    }
    return timelength;
  }
  getShowSection(show, length) {
    const showSection = {
      show,
    };
    if (show) {
      showSection.data = {
        length,
        name: show.attributes.show.name,
        startTime: this.dateHelper.getAirTimeString(show.startTimeUnix),
        classList: show.classList,
        index: show.index,
        startTimeUnix: show.startTimeUnix,
        endTimeUnix: show.endTimeUnix,
      };
    }
    return showSection;
  }
  getShows() {
    const shows = getCopy(this.dataModel.currentStation.shows.previousShows);
    shows.push(getCopy(this.dataModel.currentStation.shows.liveShow));
    return shows;
  }
  getShowContainer(event) {
    let selectedElement = event.target || event.srcElement;
    while (!selectedElement.classList.contains(TIMELINE_SHOW_CLASS)) {
      selectedElement = selectedElement.parentNode;
    }
    return selectedElement;
  }
  handleShowToggle(event) {
    const show = this.getShowContainer(event);
    const button = show.getElementsByClassName(TIMELINE_SHOW_BUTTON_CLASS)[0];
    if (this.view.isShowPlaying(button)) {
      this.player.handleShowPause();
    } else {
      const selectedShowIndex = this.view.getShowIndex(show);
      this.showCurrentShowLoading(selectedShowIndex);
      this.player.handleShowPlay(selectedShowIndex, this.isNewCurrentShow(selectedShowIndex));
    }
  }
  handlePlaying() {
    if (!this.dataModel.isInteractivePlayer()) {
      return;
    }
    this.showCurrentShowPlaying();
  }
  handlePause() {
    if (!this.dataModel.isInteractivePlayer()) {
      return;
    }
    this.view.showPlayButtons();
  }
  showCurrentShowLoading(selectedShowIndex) {
    if (this.isNewCurrentShow(selectedShowIndex)) {
      this.view.showPlayButtons();
      this.view.unsetCurrentShow();
      this.view.startLoadingSpinners(selectedShowIndex);
    }
  }
  showCurrentShowPlaying() {
    if (this.isNewCurrentShow(this.currentShowIndex)) {
      this.currentShowIndex = this.dataModel.getCurrentShowIndex();
      this.view.setCurrentShow(this.currentShowIndex);
      this.view.stopLoadingSpinners();
    }
    this.view.showPauseButtons();
  }
  isNewCurrentShow(currentShowIndex) {
    return currentShowIndex !== this.dataModel.getCurrentShowIndex();
  }
}
