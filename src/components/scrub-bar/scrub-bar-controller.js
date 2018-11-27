import RangeSlider from 'rangeslider-pure/dist/range-slider';
import ScrubBarView from './scrub-bar-view';
import { MAX_SLIDER_VALUE, SCRUB_BAR_ID } from '../../constants/scrub-bar';
import PositionHelper from '../../utils/position-helper';

export default class ScrubBarController {
  constructor(player) {
    this.player = player;
    this.dataModel = player.dataModel;
    this.positionHelper = new PositionHelper();
    this.loadRangeSlider();
    this.view = new ScrubBarView(this.dataModel);
    this.loadEvents();
  }
  loadRangeSlider() {
    const self = this;
    const scrubBar = document.getElementById(SCRUB_BAR_ID);
    RangeSlider.create(scrubBar, {
      polyfill: true,
      onSlide(position) {
        self.player.handleSlide(position);
      },
      onSlideEnd(position) {
        self.player.handleSlideEnd(position);
      },
    });
  }
  loadEvents() {
    this.view.handle.addEventListener('mouseenter', this.view.showLiveIndicator.bind(this.view));
    this.view.handle.addEventListener('mouseleave', this.view.hideLiveIndicator.bind(this.view));
  }
  loadSegments() {
    if (this.canShowScrubBar()) {
      const { segments } = this.dataModel.currentStation.shows.currentShow;
      this.view.clearSegments();
      if (segments && segments.length > 0) {
        const self = this;
        segments.forEach((segment, index) => {
          const segmentPoint = this.view.createSegmentPoint(segment.position);
          segmentPoint.addEventListener('click', self.player.handleSegmentPointClick.bind(self.player));
          segmentPoint.addEventListener('mouseenter', self.view.showSegmentIndicator.bind(self.view));
          segmentPoint.addEventListener('mouseleave', self.view.hideSegmentIndicator.bind(self.view));
          const segmentText = `Segment ${index + 1}`;
          const segmentIndicator = this.view.createSegmentIndicator(segment.position, segmentText);
          this.view.addSegment(segmentPoint, segmentIndicator);
        });
      }
    }
  }
  update() {
    if (this.canShowScrubBar() && !this.view.pause) {
      const { currentShow } = this.dataModel.currentStation.shows;
      const currentTimeUnix = Date.now() / 1000;
      const livePosition = this.dataModel.isLiveShow() ? this.positionHelper
        .getPositionFromTimestamp(
          currentShow.startTimeUnix,
          currentShow.endTimeUnix,
          currentTimeUnix,
        ) : 100;
      let handlePosition = livePosition;
      if (!this.dataModel.isLiveStream()) {
        const { secondsFromLive } = this.dataModel.currentStation;
        const handleTimeUnix = currentTimeUnix - secondsFromLive;
        handlePosition = this.positionHelper
          .getPositionFromTimestamp(
            currentShow.startTimeUnix,
            currentShow.endTimeUnix,
            handleTimeUnix,
          );
      }
      this.view.update(livePosition, handlePosition);
    }
  }
  pause() {
    this.view.pause = true;
    this.view.hideLiveIndicator();
  }
  resume() {
    this.view.pause = false;
  }
  slide(position) {
    const { currentShow } = this.dataModel.currentStation.shows;
    const currentTimeUnix = Date.now() / 1000;
    const livePosition = this.positionHelper
      .getPositionFromTimestamp(
        currentShow.startTimeUnix,
        currentShow.endTimeUnix,
        currentTimeUnix,
      );
    const isBeyondLive = position > livePosition;
    if (isBeyondLive) {
      this.view.update(livePosition, isBeyondLive ? livePosition : position);
    }
  }
  getValue() {
    return this.view.scrubBar.rangeSlider.value;
  }
  disable() {
    if (this.player.isAdPlaying) {
      this.view.disable();
    }
  }
  enable() {
    this.view.enable();
  }
  canShowScrubBar() {
    return (this.dataModel.isInteractivePlayer() && typeof (this.dataModel.currentStation.shows.currentShow) !== 'undefined');
  }
  isCurrentShowEnd() {
    const isCurrentShowEnd = (this.view.scrubBar.rangeSlider.value >= MAX_SLIDER_VALUE);
    if (isCurrentShowEnd) {
      this.view.updateValue(0);
    }
    return isCurrentShowEnd;
  }
  isLiveShowEnd() {
    const currentTimeUnix = Date.now() / 1000;
    return currentTimeUnix >= this.dataModel.currentStation.shows.liveShow.endTimeUnix;
  }
}
