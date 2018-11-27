import axios from 'axios';
import Logger from '../utils/logger';
import { RADIO_API_SERVER, RADIO_SEGMENTS_API, PROVISION_URL } from '../constants/main';

const getStation = stationId =>
  axios.get(`${RADIO_API_SERVER}/v1/stations/${stationId}`)
    .then(response => response.data.data)
    .catch(error => Logger.error(error));

const getSchedule = stationId =>
  axios.get(`${RADIO_API_SERVER}/v1/schedules?sort=day_of_week,start_time&filter[station_id]=${stationId}&page[size]=100&page[number]=1`)
    .then(response => response.data)
    .catch(error => Logger.error(error));

const getSegments = stationId =>
  axios.get(`${RADIO_SEGMENTS_API}/staging/metadata/ando/${stationId}/segment`)
    .then(response => response.data)
    .catch(error => Logger.error('Failed to get segments.', error));

const getMounts = stationName =>
  axios.get(`${PROVISION_URL}${stationName}`)
    .then(response => response.data)
    .catch(error => Logger.error(error));

const getCompanionAd = url =>
  axios.get(url)
    .then(response => response.data)
    .catch(error => Logger.error(error));

export default {
  getStation,
  getSchedule,
  getSegments,
  getMounts,
  getCompanionAd,
};
