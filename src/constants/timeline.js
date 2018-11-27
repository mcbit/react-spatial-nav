export const TIMELINE_CONTAINER_ID = 'timelineContainer';
export const TIMELINE_SHOW_CLASS = 'timelineShow';
export const TIMELINE_SHOW_START_TIME_CLASS = 'timelineShowStartTime';
export const TIMELINE_SHOW_DETAILS_CLASS = 'timelineShowDetails';
export const TIMELINE_SHOW_NAME_CLASS = 'timelineShowName';
export const TIMELINE_SHOW_TIME_CLASS = 'timelineShowTime';
export const TIMELINE_SHOW_TIME_LIVE_CLASS = 'timelineShowTimeLive';
export const TIMELINE_SHOW_NAME_TIME_CLASS = 'timelineShowNameTime';
export const TIMELINE_SHOW_LIVE_TEXT_CLASS = 'timelineShowLiveText';
export const TIMELINE_SHOW_LIVE_INDICATOR_CLASS = 'timelineShowLiveIndicator';
export const TIMEFRAME_TOTAL_LENGTH = (8 * 60 * 60);
export const TIMEFRAME_NEXT_SHOW_LENGTH = (1 * 60 * 60);
export const TIMELINE_BORDER_OFFSET = 2;
export const TIMELINE_SHOW_BUTTON_CONTAINER_CLASS = 'timelineShowButtonContainer';
export const TIMELINE_SHOW_BUTTON_CLASS = 'timelineShowButton';
export const TIMELINE_LOADING_SPINNER_CLASS = 'timelineLoadingSpinner';
export const TIMELINE_CAROUSEL_ID = 'timelineCarousel';
export const TIMELINE_NEXT_BUTTON_ID = 'timelineNextButton';
export const TIMELINE_PREV_BUTTON_ID = 'timelinePrevButton';
export const TIMELINE_CAROUSEL_CLASS = '.timelineCarousel';
export const TIMELINE_CAROUSEL_CELL_CLASS = 'timelineCarouselCell';
export const TIMELINE_BUTTON_STOP_CLASS = 'stop';
export const TIMELINE_BUTTON_LOADING_CLASS = 'loading';
export const TIMELINE_CAROUSEL_DIRECTION = {
  next: 'next',
  prev: 'prev',
  default: 'last',
};
export const TIMELINE_SHOW_TYPE = {
  previous: 'timelinePreviousShow',
  live: 'timelineLiveShow',
  current: 'timelineCurrentShow',
  upcoming: 'timelineUpcomingShow',
};

export const TIMELINE_SHOW_TIME_INFO = {
  listeningLive: 'LISTENING LIVE',
  liveOnAir: 'LIVE ON AIR',
  upcoming: 'Up Next:',
  currentlyPlaying: 'Currently Playing:',
};
export const LOAD_CURRENT_SHOW_EVENT = {
  playLiveShow: 1,
  showSelect: 2,
  currentShowEnd: 3,
  liveShowEnd: 4,
};
