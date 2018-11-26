const RADIO_API_SERVER_STG = "http://stg-origin-api.radio.com"; // eslint-disable-line no-unused-vars
const RADIO_API_SERVER_PROD = "http://api.radio.com"; // eslint-disable-line no-unused-vars
const RADIO_SEGMENTS_API_TEMP =
  "https://g6k71lazx0.execute-api.us-east-1.amazonaws.com";

export const RADIO_API_SERVER =
  typeof process.env.VUE_APP_API === "undefined"
    ? RADIO_API_SERVER_STG
    : process.env.VUE_APP_API;
export const RADIO_SEGMENTS_API =
  typeof process.env.VUE_APP_SEG === "undefined"
    ? RADIO_SEGMENTS_API_TEMP
    : process.env.VUE_APP_SEG;

export const PROVISION_URL =
  "https://playerservices.streamtheworld.com/api/livestream?version=1.9&station=";

export const SERVER_URL =
  "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/21674100491/ENT.TEST/livestreamplayer&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]&adk=4166447473&ciu_szs&cust_params=[cust_params]&dt=1476275385063&flash=23.0.0.185&frm=0&ged=ve4_td8_tt1_pd8_la8000_er28.234.574.1204_vi0.0.710.1437_vp100_eb24171&osd=6&scor=3434674995068928&sdkv=3.249.0&sdr=1&u_ah=812&u_asa=1&u_aw=1440&u_cd=24&u_h=900&u_his=2&u_java=false&u_nmime=7&u_nplug=5&u_tz=-240&u_w=1440&videoad_start_delay=0&max_ad_duration=15999";

export const HLS_STREAM_URL =
  "http://sgrewind.streamguys1.com/entercom/<station>/playlist_dvr_range-<timestamp>-<duration>.m3u8";

export const TINY_VIDEO_FOR_AD =
  "http://d2zihajmogu5jn.cloudfront.net/tiny.mp4";

export const TRITON_URL = "streamtheworld.com";

export const STREAM_FORMATS = {
  mp3: "mp3",
  aac: "aac"
};
export const AUDIO_CATEGORY_LIST = ["sports", "news", "music"];
export const AVAILABLE_FORMATS = ["aac", "mp3"]; // order matters
export const PARTNERS = {
  CBS: "CBS",
  ETM: "ETM"
};

export const MOBILE_MAX_WIDTH = 639; // 639px
export const UPDATE_SHOW_NAME_MINS = 5;
export const UPDATE_SEGMENTS_MINS = 5;
export const TIME_UPDATE_DURATION = 500;
export const MARQUEE_SPEED = 20; // px/s
export const INTERACTIVE_DEMO_STATION_ID = 417; // WFAN
export const MIN_TABLET_WIDTH = 640; // px
export const THUMB_WIDTH = 14; // px

export const WFAN_STATION = "wfan";
export const MAX_HLS_DURATION = 1800; // in seconds: 30 minutes
export const MIN_HLS_DURATION = 5;
export const MAX_SLIDER_VALUE = 100;

export const AUTOPLAY_ERROR_TYPE = "NotAllowedError";

export const NAV = window.navigator;
export const UA = NAV.userAgent.toLowerCase();
export const IS_SAFARI = /safari/i.test(UA) && !IS_CHROME;
export const IS_CHROME = /chrome/i.test(UA);
export const IS_ANDROID = /android/i.test(UA);
export const IS_STOCK_ANDROID = /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(UA);
export const IS_IE = /(trident|microsoft)/i.test(NAV.appName);
export const IS_EDGE = /edge/i.test(UA);
export const SUPPORTS_NATIVE_HLS =
  IS_SAFARI ||
  (IS_ANDROID && (IS_CHROME || IS_STOCK_ANDROID)) ||
  (IS_IE && IS_EDGE);
