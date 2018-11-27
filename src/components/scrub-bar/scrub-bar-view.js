import { SCRUB_BAR_ID, RANGE_SLIDER_BUFFER_CLASS, RANGE_SLIDER_FILL_CLASS, RANGE_SLIDER_HANDLE_CLASS, RANGE_SLIDER_CLASS, LIVE_INDICATOR_WIDTH, LIVE_INDICATOR_ID, SEGMENT_POINT_CLASS, SEGMENT_POINT_CONTAINER_ID, SEGMENT_INDICATOR_CLASS, SEGMENT_INDICATOR_TEXT_CLASS, SEGMENT_INDICATOR_POINT_CLASS, SEGMENT_INDICATOR_WIDTH, RANGE_SLIDER_BUFFER_OFFSET } from '../../constants/scrub-bar';
import { offsetOfElement } from '../../utils/main';

export default class ScrubBarView {
  constructor(dataModel) {
    this.dataModel = dataModel;
    this.pause = false;
    this.loadElements();
  }
  loadElements() {
    this.scrubBar = document.getElementById(SCRUB_BAR_ID);
    this.liveIndicator = document.getElementById(LIVE_INDICATOR_ID);
    this.segmentPointsContainer = document.getElementById(SEGMENT_POINT_CONTAINER_ID);
    this.slider = document.getElementsByClassName(RANGE_SLIDER_CLASS)[0];
    this.buffer = document.getElementsByClassName(RANGE_SLIDER_BUFFER_CLASS)[0];
    this.fill = document.getElementsByClassName(RANGE_SLIDER_FILL_CLASS)[0];
    this.handle = document.getElementsByClassName(RANGE_SLIDER_HANDLE_CLASS)[0];
  }
  update(livePosition, handlePosition) {
    this.updateValue(handlePosition);
    this.updateRangeSlider(livePosition, handlePosition);
    this.updateLiveIndicator();
  }
  updateValue(position) {
    this.scrubBar.rangeSlider.value = position;
  }
  updateRangeSlider(livePosition, handlePosition) {
    const bufferOffset = (100 - livePosition) * RANGE_SLIDER_BUFFER_OFFSET;
    this.scrubBar.rangeSlider.update({
      value: handlePosition,
      buffer: livePosition + bufferOffset,
    });
  }
  updateLiveIndicator() {
    const handlePosition = offsetOfElement(this.handle);
    this.liveIndicator.style.left = `${handlePosition.left - (LIVE_INDICATOR_WIDTH / 2)}px`;
  }
  showLiveIndicator() {
    if (this.dataModel.isLiveStream() && !this.pause) {
      this.liveIndicator.style.display = 'block';
    }
  }
  hideLiveIndicator() {
    this.liveIndicator.style.display = 'none';
  }
  clearSegments() {
    this.segmentPointsContainer.innerHTML = '';
  }
  addSegment(segmentPoint, segmentIndicator) {
    this.segmentPointsContainer.appendChild(segmentPoint);
    this.segmentPointsContainer.appendChild(segmentIndicator);
  }
  createSegmentPoint(position) {
    const segmentPoint = document.createElement('div');
    segmentPoint.classList.add(SEGMENT_POINT_CLASS);
    segmentPoint.style.left = `${position}%`;
    return segmentPoint;
  }
  createSegmentIndicator(position, text) {
    const segmentIndicator = document.createElement('div');
    segmentIndicator.classList.add(SEGMENT_INDICATOR_CLASS);
    segmentIndicator.style.left = `calc(${position}% - ${SEGMENT_INDICATOR_WIDTH / 2}px)`;
    const segmentText = document.createElement('div');
    segmentText.classList.add(SEGMENT_INDICATOR_TEXT_CLASS);
    segmentText.innerHTML = text;
    const segmentPoint = document.createElement('div');
    segmentPoint.classList.add(SEGMENT_INDICATOR_POINT_CLASS);
    segmentIndicator.appendChild(segmentText);
    segmentIndicator.appendChild(segmentPoint);
    return segmentIndicator;
  }
  showSegmentIndicator(event) {
    const el = event.target || event.srcElement;
    const segmentIndicator = el.nextElementSibling;
    segmentIndicator.style.display = 'inline-block';
  }
  hideSegmentIndicator(event) {
    const el = event.target || event.srcElement;
    const segmentIndicator = el.nextElementSibling;
    segmentIndicator.style.display = 'none';
  }
  disable() {
    this.scrubBar.disabled = true;
    this.scrubBar.rangeSlider.update();
  }
  enable() {
    this.scrubBar.disabled = false;
    this.scrubBar.rangeSlider.update();
  }
}
