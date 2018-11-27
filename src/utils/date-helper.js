import moment from 'moment-timezone';

export default class DateHelper {
  getStartEndString(startTimeUnix, endTimeUnix) {
    const startTimeString = this.getAirTimeString(startTimeUnix);
    const endTimeString = this.getAirTimeString(endTimeUnix);
    const timeZoneString = this.getTimeZoneString();
    const airedString = `Aired ${startTimeString} to ${endTimeString} ${timeZoneString}`;
    return airedString;
  }
  getAirTimeString(unixTime) {
    const time = moment(unixTime * 1000);
    const timeString = time.format('LT').toLowerCase().replace(' ', '');
    return timeString;
  }
  getTimeZoneString() {
    const timeZone = moment.tz.guess();
    const date = moment().format();
    const timeZoneString = moment.tz(date, timeZone).format('z');
    return timeZoneString;
  }
  setShowUnixTimes(show) {
    const showStart = this.getShowDate(
      show.attributes.start_time,
      this.getDayOfWeek(show.attributes.day_of_week),
    );
    const showEnd = this.getShowDate(
      show.attributes.end_time,
      this.getDayOfWeek(show.attributes.day_of_week),
    );
    if (showEnd <= showStart) {
      showEnd.add(1, 'day');
    }
    show.startTimeUnix = parseInt(showStart.valueOf() / 1000, 10);
    show.endTimeUnix = parseInt(showEnd.valueOf() / 1000, 10);
    show.length = show.endTimeUnix - show.startTimeUnix;
    show.remaining = 0;
  }
  getShowDate(timeString, dayOfWeek) {
    const showDate = moment.utc(timeString, 'HH:mm:ss');
    showDate.isoWeekday(dayOfWeek);
    return showDate.local();
  }
  getDayOfWeek(dayOfWeek) {
    const today = moment().utc().isoWeekday();
    if (today === 1 && (dayOfWeek === 7 || dayOfWeek === 6)) {
      return dayOfWeek - 7;
    } else if (today === 7 && dayOfWeek === 1) {
      return 8;
    } else if (today === 6 && (dayOfWeek === 7 || dayOfWeek === 1)) {
      return dayOfWeek + 7;
    }
    return dayOfWeek;
  }
}
