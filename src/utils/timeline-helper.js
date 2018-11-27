import moment from 'moment';
import DateHelper from './date-helper';
import { getCopy } from './main';
import { TIMELINE_SHOW_TYPE } from '../constants/timeline';

export default class TimlineHelper {
  constructor(dataModel) {
    this.dataModel = dataModel;
    this.dateHelper = new DateHelper();
  }
  load() {
    this.endTimeUnix = moment().valueOf() / 1000;
    this.startTimeUnix = moment().subtract(1, 'days').valueOf() / 1000;
    this.shows = {
      previousShows: [],
      currentShow: undefined,
      liveShow: undefined,
      upcomingShow: undefined,
      immediatePredecessor: undefined,
      immediateSucessor: undefined,
    };
  }
  getShows() {
    this.load();
    const schedule = getCopy(this.dataModel.currentStation.schedule.data);
    schedule.forEach((s) => {
      const show = getCopy(s);
      this.dateHelper.setShowUnixTimes(show);
      if (this.isUpcomingShow(show)) {
        this.setUpcomingShow(show);
      } else if (this.isLiveShow(show)) {
        this.setLiveShow(show);
      } else if (this.isPreviousShow(show)) {
        this.setPreviousShow(show);
      } else if (this.isImmediatePredecessor(show)) {
        this.shows.immediatePredecessor = show;
      } else if (this.isImmediateSuccessor(show)) {
        this.shows.immediateSucessor = show;
      }
    });
    this.setGaps();
    return this.shows;
  }
  getDefaultShow(startTimeUnix, endTimeUnix) {
    const defaultShow = {
      isFiller: true,
      attributes: {
        show: {
          name: this.dataModel.currentStation.attributes.name,
        },
      },
      startTimeUnix,
      endTimeUnix,
      startString: moment(startTimeUnix * 1000).format('dddd, MMMM Do YYYY, h:mm:ss a'),
      endString: moment(endTimeUnix * 1000).format('dddd, MMMM Do YYYY, h:mm:ss a'),
      length: endTimeUnix - startTimeUnix,
      remaining: 0,
    };
    return defaultShow;
  }
  setUpcomingShow(upcomingShow) {
    upcomingShow.classList = [TIMELINE_SHOW_TYPE.upcoming];
    this.shows.upcomingShow = upcomingShow;
  }
  setLiveShow(liveShow) {
    liveShow.classList = [TIMELINE_SHOW_TYPE.live];
    this.shows.liveShow = liveShow;
  }
  setPreviousShow(previousShow) {
    previousShow.classList = [TIMELINE_SHOW_TYPE.previous];
    previousShow.index = this.shows.previousShows.length;
    this.shows.previousShows.push(previousShow);
  }
  setGaps() {
    this.setTimelineStart();
    this.setPreviousShows();
    this.setTimelineEnd();
  }
  setTimelineStart() {
    const timelineStart = this.shows.previousShows[0];
    if (timelineStart.startTimeUnix > this.startTimeUnix) {
      const defaultStartShow = this.getDefaultShow(
        this.shows.immediatePredecessor.endTimeUnix,
        timelineStart.startTimeUnix,
      );
      this.shows.previousShows.unshift(defaultStartShow);
    }
  }
  setPreviousShows() {
    const previousShows = getCopy(this.shows.previousShows);
    this.shows.previousShows = [];
    let previousShow = previousShows.shift();
    while (previousShow) {
      this.setPreviousShow(previousShow);
      const nextShow = (previousShows[0]) ? previousShows[0] : this.shows.liveShow;
      if (nextShow) {
        const isSequential = previousShow.endTimeUnix === nextShow.startTimeUnix;
        if (!isSequential) {
          const defaultShow = this.getDefaultShow(
            previousShow.endTimeUnix,
            nextShow.startTimeUnix,
          );
          previousShows.unshift(defaultShow);
        }
      }
      previousShow = previousShows.shift();
    }
  }
  setTimelineEnd() {
    if (!this.shows.upcomingShow) {
      let defaultUpcomingShow = this.shows.immediateSucessor;
      if (!this.shows.liveShow) {
        const timelineEnd = this.shows.previousShows[this.shows.previousShows.length - 1];
        const defaultLiveShow = this.getDefaultShow(
          timelineEnd.endTimeUnix,
          this.shows.immediateSucessor.startTimeUnix,
        );
        this.setLiveShow(defaultLiveShow);
      } else {
        defaultUpcomingShow = this.getDefaultShow(
          this.shows.liveShow.endTimeUnix,
          this.shows.immediateSucessor.startTimeUnix,
        );
      }
      this.setUpcomingShow(defaultUpcomingShow);
    }
  }
  isUpcomingShow(show) {
    if (!this.shows.upcomingShow && this.shows.liveShow) {
      if (show.startTimeUnix === this.shows.liveShow.endTimeUnix) {
        return true;
      }
    }
    return false;
  }
  isLiveShow(show) {
    if (!this.shows.liveShow) {
      if (show.endTimeUnix > this.endTimeUnix && show.startTimeUnix <= this.endTimeUnix) {
        return true;
      }
    }
    return false;
  }
  isPreviousShow(show) {
    return (show.endTimeUnix > this.startTimeUnix && show.endTimeUnix <= this.endTimeUnix);
  }
  isImmediatePredecessor(show) {
    if (show.endTimeUnix <= this.startTimeUnix) {
      if (!this.shows.immediatePredecessor ||
        show.startTimeUnix > this.shows.immediatePredecessor.startTimeUnix) {
        return true;
      }
    }
  }
  isImmediateSuccessor(show) {
    if (show.endTimeUnix > this.endTimeUnix) {
      if (!this.shows.immediateSucessor ||
        show.startTimeUnix < this.shows.immediateSucessor.startTimeUnix) {
        return true;
      }
    }
    return false;
  }
}
