import StationDetailsView from './station-details-view';
import { AUDIO_CATEGORY_LIST } from '../../constants/main';
import { SBM_CUE_POINT, SBM_AD, SBM_AD_NAME } from '../../constants/station-details';
import Logger from '../../utils/logger';
import MarqueeHelper from '../../utils/marquee-helper';
import PositionHelper from '../../utils/position-helper';

export default class StationDetailsController {
  constructor(player) {
    this.view = new StationDetailsView();
    this.player = player;
    this.dataModel = player.dataModel;
    this.lastUpdateWasAdBreak = false;
  }
  update(sbm) {
    if (sbm) {
      this.updateSBMDetails(sbm);
    } else {
      this.updateStationDetails();
    }
  }
  updateStationDetails() {
    const { currentStation } = this.dataModel;
    this.view.reset();
    this.view.updatePoster(currentStation.attributes.square_logo_small);
    this.view.updateStationName(currentStation.attributes.name);
    if (this.isMusic()) {
      this.view.updateShowDescription('', true);
    } else {
      this.view.updateShowName(currentStation.shows.currentShow.attributes.show.name);
      this.view.updateShowDescription(currentStation.shows.currentShow, false);
    }
  }
  updateSBMDetails(sbm) {
    const { currentStation } = this.dataModel;
    const isAd = (sbm.type === SBM_CUE_POINT && sbm.name === SBM_AD);
    if (isAd) {
      this.updateAdDetails();
    } else {
      if (this.isMusic()) {
        Logger.log('Updating music category');
        const trackCover = sbm.parameters.track_cover_url ||
          currentStation.attributes.square_logo_small;
        this.view.updateShowName(sbm.parameters.cue_title);
        this.view.updateShowDescription(sbm.parameters.track_artist_name, true);
        this.view.updatePoster(trackCover);
      } else {
        this.view.updateShowName(currentStation.shows.currentShow.attributes.show.name);
      }
      MarqueeHelper.updateMinimizedMarquee();
    }
  }
  updateAdDetails() {
    const { currentStation } = this.dataModel;
    if (this.isMusic()) {
      this.view.updateShowDescription('', true);
    }
    this.view.updateShowName(SBM_AD_NAME);
    this.view.updatePoster(currentStation.attributes.square_logo_small);
  }
  updateSegmentDetails(handlePosition) {
    if (!this.dataModel.isLiveStream()) {
      if (this.isAdBreak(handlePosition)) {
        if (!this.lastUpdateWasAdBreak) {
          this.updateAdDetails();
          this.lastUpdateWasAdBreak = true;
        }
      } else if (this.lastUpdateWasAdBreak) {
        this.updateStationDetails();
        this.lastUpdateWasAdBreak = false;
      }
    }
  }
  isMusic() {
    const { category } = this.dataModel.currentStation.attributes;
    return category.toLowerCase() === AUDIO_CATEGORY_LIST[2];
  }
  isAdBreak(position) {
    const { currentShow } = this.dataModel.currentStation.shows;
    if (!currentShow.adBreaks) {
      return false;
    }
    const positionHelper = new PositionHelper();
    const handleTimeUnix = positionHelper
      .getTimestampFromPosition(currentShow.startTimeUnix, currentShow.endTimeUnix, position);
    let isAdBreak = false;

    currentShow.adBreaks.some((adSegment) => {
      if (handleTimeUnix > adSegment.start_time && handleTimeUnix < adSegment.end_time) {
        isAdBreak = true;
        return true;
      }
      return false;
    });
    return isAdBreak;
  }
}
