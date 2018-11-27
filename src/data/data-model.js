import Logger from '../utils/logger';
import { checkIfIE } from '../utils/main';
import API from './api';
import StreamHelper from '../utils/stream-helper';
import { AVAILABLE_FORMATS, INTERACTIVE_DEMO_STATION_ID, MAX_HLS_DURATION, MIN_HLS_DURATION, TIME_UPDATE_DURATION } from '../constants/main';
import { LIST_DIRECTION } from '../constants/player-controls';
import PositionHelper from '../utils/position-helper';
import { SEGMENTS_MOCK_DATA } from '../constants/scrub-bar';
import { TIMELINE_SHOW_TYPE, LOAD_CURRENT_SHOW_EVENT } from '../constants/timeline';
import TimelineHelper from '../utils/timeline-helper';

export default class DataModel {
  constructor() {
    this.stationList = [];
    this.currentStationIndex = -1;
    this.showsFromLive = undefined;
    this.currentStation = undefined;
    this.streamURL = undefined;
    this.availableFormats = [];
    this.loadSegmentsMock = false;
    this.isCurrentShowExpired = false;
    this.streamHelper = new StreamHelper();
    this.positionHelper = new PositionHelper();
  }
  async loadStationList(currentStationIndex, stationData, replace) {
    this.setStationList(stationData, replace);
    await this.loadCurrentStation(currentStationIndex);
  }
  async loadCurrentStation(currentStationIndex) {
    await this.setCurrentStation(currentStationIndex);
    await this.setSchedule();
    this.setAvailableFormats();
    await this.loadShows();
  }
  async loadShows(loadEvent = LOAD_CURRENT_SHOW_EVENT.playLiveShow) {
    this.setShows();
    await this.loadCurrentShow(loadEvent);
  }
  async loadCurrentShow(loadEvent, selectedShowIndex) {
    this.setCurrentShow(loadEvent, selectedShowIndex);
    await this.loadSegments();
    if (loadEvent === LOAD_CURRENT_SHOW_EVENT.playLiveShow) {
      const reloadLiveStream = !(this.currentStation.liveStreamURL);
      await this.loadStreamURL(reloadLiveStream);
    } else if (loadEvent === LOAD_CURRENT_SHOW_EVENT.showSelect) {
      await this.loadStreamURL(false, 0);
    }
  }
  async loadSegments() {
    await this.setSegments();
  }
  async loadStreamURL(reloadLiveStream, streamPosition, streamDirection) {
    let selectedTimeUnix;

    if (this.currentStation.shows) {
      const { currentShow } = this.currentStation.shows;
      selectedTimeUnix = this.positionHelper
        .getSelectedTimeUnix(streamPosition, streamDirection, currentShow);
      this.loadSecondsFromLive(true, true, selectedTimeUnix);
    }
    if (this.isLiveStream()) {
      if (reloadLiveStream) {
        await this.setLiveStreamURL();
      }
      this.streamURL = this.currentStation.liveStreamURL;
    } else {
      const { secondsFromLive } = this.currentStation;
      const duration = (secondsFromLive > MAX_HLS_DURATION) ? MAX_HLS_DURATION : secondsFromLive;
      this.streamURL = this.streamHelper.getAiredStreamURL(selectedTimeUnix, duration);
    }
  }
  loadSecondsFromLive(isPlaying, reloadSecondsFromLive, selectedTimeUnix) {
    if (!isPlaying && !this.isLiveStream()) {
      this.currentStation.secondsFromLive += TIME_UPDATE_DURATION / 1000;
    } else if (reloadSecondsFromLive) {
      this.setSecondsFromLive(selectedTimeUnix);
    }
  }
  setStationList(stationData, replace) {
    const dataType = stationData.constructor.name;
    if (replace) {
      this.stationList = [];
    }
    if (dataType === 'Array') {
      this.stationList = this.stationList.concat(stationData);
    } else if (dataType === 'Object'
        || (dataType === 'Number'
        || !Number.isNaN(Number(stationData)))) {
      this.stationList.push(stationData);
    }
  }
  async setCurrentStation(currentStationIndex) {
    this.currentStationIndex = currentStationIndex;
    const stationInstance = this.stationList[this.currentStationIndex];
    const dataType = stationInstance.constructor.name;

    if (dataType !== 'Object') {
      const station = await API.getStation(stationInstance)
        .catch(error => Logger.error('Error: Failed to get station object', error));
      this.stationList[this.currentStationIndex] = station;
      this.currentStation = station;
    } else {
      this.currentStation = stationInstance;
    }
  }
  async setSchedule() {
    if (!this.currentStation.schedule) {
      const stationId = this.currentStation.id;
      const schedule = await API.getSchedule(stationId)
        .catch(error => Logger.error('Error: Failed to get schedule for station', error));
      this.currentStation.schedule = schedule;
    }
  }
  setShows() {
    if (!this.currentStation.schedule || this.currentStation.schedule.data.length === 0) {
      this.currentStation.shows = undefined;
      return;
    }
    const timelineHelper = new TimelineHelper(this);
    this.currentStation.shows = timelineHelper.getShows();
  }
  setCurrentShow(loadEvent, selectedShowIndex) {
    const { shows } = this.currentStation;
    if (!shows) {
      return;
    }
    this.clearCurrentShowClass();
    this.setShowsFromLive(loadEvent, selectedShowIndex);
    if (this.isLiveShow()) {
      shows.currentShow = shows.liveShow;
    } else {
      this.isCurrentShowExpired = this.getCurrentShowIndex() < 0;
      if (this.isCurrentShowExpired) {
        shows.currentShow = shows.immediatePredecessor;
      } else {
        shows.currentShow = shows.previousShows[this.getCurrentShowIndex()];
      }
    }
    this.addCurrentShowClass();
  }
  setShowsFromLive(loadEvent, selectedShowIndex) {
    if (loadEvent === LOAD_CURRENT_SHOW_EVENT.playLiveShow) {
      this.showsFromLive = 0;
    } else if (loadEvent === LOAD_CURRENT_SHOW_EVENT.showSelect) {
      const isLiveShowSelected = !(selectedShowIndex >= 0);
      if (isLiveShowSelected) {
        this.showsFromLive = 0;
      } else {
        this.showsFromLive = this.currentStation.shows.previousShows.length - selectedShowIndex;
      }
    } else if (loadEvent === LOAD_CURRENT_SHOW_EVENT.currentShowEnd) {
      if (this.isCurrentShowExpired) {
        this.showsFromLive = this.currentStation.shows.previousShows.length;
      } else {
        this.showsFromLive--;
      }
    } else if (loadEvent === LOAD_CURRENT_SHOW_EVENT.liveShowEnd) {
      if (!this.isLiveStream()) {
        if (this.isCurrentShowExpired) {
          this.showsFromLive = this.currentStation.shows.previousShows.length;
        } else {
          this.showsFromLive++;
        }
      }
    }
  }
  async setSegments() {
    if (!this.currentStation.shows) {
      return;
    }
    const { currentShow } = this.currentStation.shows;
    if (this.loadSegmentsMock && this.isInteractivePlayer()) {
      currentShow.segments = SEGMENTS_MOCK_DATA;
    } else if (currentShow && this.isInteractivePlayer()) {
      const segmentsData = await API.getSegments(this.currentStation.id);
      currentShow.segments = [];
      currentShow.adBreaks = [];
      if (segmentsData.data) {
        segmentsData.data.some((segment) => {
          const isWithinShow = currentShow.startTimeUnix < segment.start_time &&
            currentShow.endTimeUnix > segment.start_time;
          if (isWithinShow) {
            segment.position = this.positionHelper.getPositionFromTimestamp(
              currentShow.startTimeUnix,
              currentShow.endTimeUnix,
              segment.start_time,
            );
            if (segment.segment_type === 'content') {
              currentShow.segments.push(segment);
            } else if (segment.segment_type === 'adbreak') {
              currentShow.adBreaks.push(segment);
            }
          }
          return (segment.start_time > currentShow.endTimeUnix);
        });
      }
    }
  }
  setAvailableFormats() {
    this.availableFormats = AVAILABLE_FORMATS.slice();
    if (checkIfIE()) {
      this.availableFormats.splice(0, 1);
    }
    Logger.log('RESETTING AVAILABLE FORMATS', this.availableFormats);
  }
  async setLiveStreamURL() {
    const streamFormat = this.getAvailableFormat();
    if (streamFormat) {
      const liveStreamURL = await this.streamHelper
        .getFormattedStream(this.currentStation, streamFormat);
      this.currentStation.liveStreamURL = liveStreamURL;
    } else {
      this.currentStation.liveStreamURL = undefined;
    }
  }
  setSecondsFromLive(selectedTimeUnix) {
    if (selectedTimeUnix) {
      const currentTimeUnix = Date.now() / 1000;
      let duration = parseInt(currentTimeUnix - selectedTimeUnix, 10);
      duration = (duration < MIN_HLS_DURATION) ? 0 : duration;
      this.currentStation.secondsFromLive = duration;
    } else {
      this.currentStation.secondsFromLive = 0;
    }
  }
  getAvailableFormat() {
    return this.availableFormats.shift();
  }
  getUpdatedStationIndex(direction) {
    if (this.stationList.length > 1) {
      let updateStationIndex = this.currentStationIndex;
      if (direction === LIST_DIRECTION.next) {
        if (updateStationIndex >= this.stationList.length - 1) {
          updateStationIndex = 0;
        } else {
          updateStationIndex++;
        }
      } else if (direction === LIST_DIRECTION.prev) {
        if (updateStationIndex <= 0) {
          updateStationIndex = this.stationList.length - 1;
        } else {
          updateStationIndex--;
        }
      }
      return updateStationIndex;
    }
    return 0;
  }
  clearCurrentShowClass() {
    if (this.currentStation.shows.currentShow && !this.isCurrentShowExpired) {
      const index = this.currentStation.shows.currentShow
        .classList.indexOf(TIMELINE_SHOW_TYPE.current);
      this.currentStation.shows.currentShow.classList.splice(index, 1);
    }
  }
  addCurrentShowClass() {
    if (this.isCurrentShowExpired) {
      return;
    }
    const index = this.currentStation.shows.currentShow
      .classList.indexOf(TIMELINE_SHOW_TYPE.current);
    if (index === -1) {
      this.currentStation.shows.currentShow.classList.push(TIMELINE_SHOW_TYPE.current);
    }
  }
  getCurrentShowIndex() {
    if (this.isLiveShow()) {
      return;
    }
    const index = this.currentStation.shows.previousShows.length - this.showsFromLive;
    return index;
  }
  isLiveStream() {
    return (!this.currentStation.shows ||
      this.currentStation.secondsFromLive === 0
    );
  }
  isLiveShow() {
    return this.showsFromLive === 0;
  }
  isCurrentShowExpired() {
    return this.getCurrentShowIndex() < 0;
  }
  isInteractivePlayer() {
    return ((this.currentStation.id === INTERACTIVE_DEMO_STATION_ID) &&
            (typeof (this.currentStation.shows) !== 'undefined') &&
            (typeof (this.currentStation.shows.currentShow) !== 'undefined'));
  }
}
