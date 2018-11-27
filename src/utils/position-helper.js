export default class PositionHelper {
  getPositionFromTimestamp(startTime, endTime, time) {
    const timeLength = endTime - startTime;
    const offest = time - startTime;
    const position = (offest / timeLength) * 100;
    return position;
  }
  getTimestampFromPosition(startTime, endTime, position) {
    const timeLength = endTime - startTime;
    const offset = (position / 100) * timeLength;
    const time = parseInt((offset + startTime), 10);
    return time;
  }
  getSelectedTimeUnix(streamPosition, streamDirection, currentShow) {
    let selectedTimeUnix;
    if (streamPosition >= 0) {
      const currentTimeUnix = Date.now() / 1000;
      const { startTimeUnix } = currentShow;
      selectedTimeUnix = this.getTimestampFromPosition(
        currentShow.startTimeUnix,
        currentShow.endTimeUnix,
        streamPosition,
      );
      if (streamDirection) {
        selectedTimeUnix += streamDirection;
        if (selectedTimeUnix > currentTimeUnix) {
          selectedTimeUnix = currentTimeUnix;
        } else if (selectedTimeUnix < startTimeUnix) {
          selectedTimeUnix = startTimeUnix;
        }
      }
    }
    return selectedTimeUnix;
  }
}
