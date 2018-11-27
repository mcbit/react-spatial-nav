import React, { Component } from "react";
import TemplateController from "./components/template/template-controller";
import PlayerControlsController from "./components/player-controls/player-controls-controller";
import StationDetailsController from "./components/station-details/station-details-controller";
import ScrubBarController from "./components/scrub-bar/scrub-bar-controller";
import AdsController from "./components/ads/ads-controller";
import TimelineController from "./components/timeline/timeline-controller";
import Logger from "./utils/logger";
import DataModel from "./data/data-model";

import "rangeslider-pure/dist/range-slider.css"; // Required to generate css file
import "tiny-slider/dist/tiny-slider.css"; // Required to generate css file
import StreamHelper from "./utils/stream-helper";
import {
  UPDATE_SEGMENTS_MINS,
  UPDATE_SHOW_NAME_MINS,
  TIME_UPDATE_DURATION,
  AUTOPLAY_ERROR_TYPE
} from "./constants/main";

import { LOAD_CURRENT_SHOW_EVENT } from "./constants/timeline";
import ComscoreHelper from "./utils/comscore-helper";

class RadioPlayer extends Component {
  constructor(props) {
    super(props);
    this.dataModel = new DataModel();
    this.SBMConnection = undefined;
    this.segmentsIntervalID = undefined;
    this.showIntervalID = undefined;
    this.secondsFromLiveTimerID = undefined;
    this.isAdPlaying = false;
    // this.isInitialized = false;
    this.pause = false;
    // this.initialize();
  }

  componentDidMount() {
    this.initializeComponents();

    const SpatialNavigation = window.SpatialNavigation;

    SpatialNavigation.add("playButton", {
      selector: "#playButtonContainer",
      leaveFor: { up: "@menu" },
      enterTo: "default-element",
      defaultElement: "#playButton"
    });
    this.updateStationList(this.props.station, 0);
  }
  componentDidUpdate(prevProps) {
    if (this.props.station !== prevProps.station) {
      this.updateStationList(this.props.station, 0);
    }
  }

  // initialize() {
  //   if (!this.isInitialized) {
  //     this.initializeComponents();
  //     this.isInitialized = true;
  //     // Logger.log("Player has been intialized");
  //   } else {
  //     Logger.warn("Player has already been intialized");
  //   }
  // }

  initializeComponents() {
    this.template = new TemplateController(this);
    this.template.load();
    this.playerControls = new PlayerControlsController(this);
    this.stationDetails = new StationDetailsController(this);
    this.scrubBar = new ScrubBarController(this);
    this.adsControls = new AdsController(this);
    this.timeline = new TimelineController(this);
  }
  async updateStationList(
    stationData,
    currentStationIndex = 0,
    replace = true
  ) {
    debugger;
    Logger.log("UPDATING STATION LIST");
    this.playerControls.startLoadingSpinner();
    this.template.popup();
    await this.dataModel.loadStationList(
      currentStationIndex,
      stationData,
      replace
    );
    this.playStation();
  }
  /**
   * @access private
   * Called to change the station in the station list that is being played.
   * @param {string} direction Direction to move in the station list.
   * See 'LIST_DIRECTION' variable in player-controls.
   */
  async updateStation(direction) {
    Logger.log("UPDATING STATION");
    this.playerControls.startLoadingSpinner();
    const updatedStationIndex = this.dataModel.getUpdatedStationIndex(
      direction
    );
    await this.dataModel.loadCurrentStation(updatedStationIndex);
    this.playStation();
  }
  /**
   * @access private
   * Called to update the shows of the station when the current live show ends
   */
  async updateShows() {
    Logger.log("UPDATING SHOWS");
    await this.dataModel.loadShows(LOAD_CURRENT_SHOW_EVENT.liveShowEnd);
    this.stationDetails.update();
    this.scrubBar.update();
    this.scrubBar.loadSegments();
    this.timeline.load();
    this.timeline.handlePlaying();
  }
  /**
   * @access private
   * Called to update the currently playing show of the station.
   * @param {string} loadEvent Describes how to set the current show based off the type of event.
   * See LOAD_CURRENT_SHOW_EVENT in timeline.
   * @param {?number} selectedShowIndex Index of show to play when selected on the station timeline.
   */
  async updateCurrentShow(loadEvent, selectedShowIndex) {
    Logger.log("UPDATING CURRENT SHOW", selectedShowIndex);
    this.playerControls.startLoadingSpinner();
    this.scrubBar.pause();
    await this.dataModel.loadCurrentShow(loadEvent, selectedShowIndex);
    this.scrubBar.resume();
    this.stationDetails.update();
    this.scrubBar.update();
    this.scrubBar.loadSegments();
    this.playStream();
  }
  /**
   * @access private
   * Called to update the segments of the currently playing show.
   */
  async updateSegments() {
    Logger.log("UPDATING SEGMENTS");
    await this.dataModel.loadSegments();
    this.scrubBar.loadSegments();
  }
  /**
   * @access private
   * Updates the currently playing stream when the user scrubs the scrub bar
   * or fast-forwards/rewinds the stream.
   * @param {?number} position The position scrubbed to on the scrub bar (in percentage).
   * @param {?string} direction The direction denoting whether the stream
   * should be fast-forwarded or rewound.
   * See STREAM_DIRECTION in player-controls.
   * @param {?boolean} autoplay Keeps the audio player either paused
   * or playing when the stream is fast-forwarded or rewound.
   */
  async updateStream(position, direction, autoplay) {
    Logger.log("UPDATING STREAM");
    this.playerControls.startLoadingSpinner();
    await this.dataModel.loadStreamURL(false, position, direction);
    this.playerControls.loadStream(autoplay);
    this.stationDetails.updateSegmentDetails(position);
  }
  /**
   * @access private
   * Called every 0.5 seconds to update the player's components based on certain events.
   * Such events include when a live show ends, when a currently playing show
   * which is not live ends.
   * Updates the position of the thumb/handle, and live buffer on the scrub-bar.
   * Updates the station details to display whether the user is listening to an ad.
   */
  async updateSecondsFromLive() {
    if (!this.dataModel.isInteractivePlayer()) {
      return;
    }
    const isPlaying = this.playerControls.isPlaying();
    this.dataModel.loadSecondsFromLive(isPlaying, false);
    this.scrubBar.update();
    if (this.scrubBar.isLiveShowEnd()) {
      await this.updateShows();
    }
    if (this.scrubBar.isCurrentShowEnd()) {
      if (!this.dataModel.isLiveStream()) {
        await this.updateCurrentShow(LOAD_CURRENT_SHOW_EVENT.currentShowEnd);
      }
    }
    const handlePosition = this.scrubBar.getValue();
    this.stationDetails.updateSegmentDetails(handlePosition);
  }
  /**
   * @access private
   * Delegates tasks to components when playing a new station.
   */
  playStation() {
    Logger.log("PLAYING STATION");
    this.loadViews();
    this.playStream();
    this.startVideoAd();
    this.setTimers();
    this.triggerAnalytics();
  }
  /**
   * @access private
   * Loads the views of the components when a new station is played.
   */
  loadViews() {
    this.template.setCategory();
    this.template.toggleInteractivePlayer();
    this.stationDetails.update();
    this.scrubBar.update();
    this.scrubBar.loadSegments();
    this.timeline.load();
  }
  /**
   * @access private
   * Called when a new station or show is played.
   */
  playStream() {
    this.closeSBMConnection();
    this.playerControls.loadStream();
  }
  /**
   * @access private
   * Called when a new station is played.
   */
  startVideoAd() {
    this.adsControls.playVideoAd();
    this.playerControls.disable();
    this.scrubBar.disable();
  }
  /**
   * @access private
   * Called when a new station is played.
   */
  setTimers() {
    this.setSegmentsTimer();
    this.setShowTimer();
    this.setSecondsFromLiveTimer();
  }
  /**
   * @access private
   * Called when a stream has loaded. Opens a sideband metadata connection for live streams.
   * Sideband metadata provides ad and track cue points.
   */
  handleLoadedMetaData() {
    const station = this.dataModel.currentStation;
    Logger.log("Changed stream url", station);
    this.closeSBMConnection();
    const streamHelper = new StreamHelper();
    if (
      streamHelper.isTritonStream(station.liveStreamURL) &&
      this.dataModel.isLiveStream()
    ) {
      const SBMUrl = streamHelper.getSBMURL(station.liveStreamURL);
      this.SBMConnection = new EventSource(SBMUrl);
      this.SBMConnection.onmessage = this.onSBMMessage.bind(this);
    }
  }
  /**
   * Called when a media event error occurs when trying to play a stream.
   * If the currently playing stream is live, this will try to
   * reload the stream in a different format (aac or mp3).
   * @param {Event} event Error event from the HTML audio element.
   */
  async handleMediaError(event) {
    Logger.log("A problem occurred during stream playback", event);
    if (this.dataModel.isLiveStream()) {
      await this.dataModel.loadStreamURL(true);
      if (this.dataModel.currentStation.liveStreamURL) {
        this.playerControls.loadStream();
      } else {
        Logger.log("No more available formats to play");
      }
    }
  }
  /**
   * @access private
   * Called when the user is scrubbing on the scrub-bar.
   * @param {number} position Current position (in percentage) of the thumb/handle on the scrub-bar.
   */
  handleSlide(position) {
    this.scrubBar.pause();
    this.scrubBar.slide(position);
  }
  /**
   * @access private
   * Called when the user is finished scrubbing on the scrub-bar.
   * @param {*} position Final position (in percentage) of the thumb/handle on the scrub-bar.
   */
  async handleSlideEnd(position) {
    await this.updateStream(position);
    this.scrubBar.resume();
  }
  /**
   * Called when the user clicks on a segment point on the scrub-bar.
   * @param {Event} event The click event triggered from the segment point.
   */
  handleSegmentPointClick(event) {
    const segmentPoint = event.target || event.srcElement;
    const position = parseFloat(segmentPoint.style.left);
    this.updateStream(position);
  }
  /**
   * @access private
   * Called when the user clicks the live button in order
   * to listen to the live stream of the current station.
   */
  async handleLivePlay() {
    if (!this.dataModel.isLiveStream()) {
      if (this.dataModel.isLiveShow()) {
        await this.updateStream();
      } else {
        this.timeline.showCurrentShowLoading();
        await this.updateCurrentShow(LOAD_CURRENT_SHOW_EVENT.playLiveShow);
      }
    }
  }
  /**
   * @access private
   * HLS streams for previously aired (timeshifted) content are loaded in chunks.
   * When a chunk finishes, this will load the subsequent chunk.
   */
  handleStreamEnded() {
    const position = this.scrubBar.getValue();
    this.updateStream(position);
  }
  /**
   * @access private
   * Called when a video ad finishes.
   * Enables controls of components in the player.
   */
  handleVideoAdEnd() {
    this.playerControls.enable();
    this.scrubBar.enable();
  }
  /**
   * @access private
   * Called when the toggle timeline button is clicked.
   * Displays or hides the station timeline.
   */
  handleTimelineClick() {
    this.template.toggleTimeline();
  }
  /**
   * @access private
   * Called when a show is selected to play on the station timeline.
   * @param {number} selctedShowIndex Index of show selected in station timeline.
   * @param {boolean} isNewCurrentShow Indicates whether the show selected
   * is different from the currently playing show.
   */
  handleShowPlay(selctedShowIndex, isNewCurrentShow) {
    if (isNewCurrentShow) {
      this.updateCurrentShow(
        LOAD_CURRENT_SHOW_EVENT.showSelect,
        selctedShowIndex
      );
    } else {
      this.playerControls.play();
    }
  }
  /**
   * @access private
   * Called when the pause button of the currently playing show on the station timeline is selected.
   */
  handleShowPause() {
    this.playerControls.pause();
  }
  /**
   * Called when the forward or rewind buttons are selected.
   * @param {string} direction The direction denoting whether the stream
   * should be fast-forwarded or rewound.
   * See STREAM_DIRECTION in player-controls.
   */
  handleStreamSeek(direction) {
    const streamPosition = this.scrubBar.getValue();
    this.updateStream(
      streamPosition,
      direction,
      this.playerControls.isPlaying()
    );
  }
  /**
   * @access private
   * Called when the stream has started playing.
   * Updates the components to signal that the player has finished loading.
   */
  handlePlaying() {
    this.playerControls.stopLoadingSpinner();
    this.playerControls.handlePlaying();
    this.timeline.handlePlaying();
  }
  /**
   * @access private
   * Called when the stream is paused.
   * Updates the components to signal that the stream has paused.
   */
  handlePause() {
    this.playerControls.handlePause();
    this.timeline.handlePause();
  }
  /**
   * Called when a request to play the HTML audio element fails.
   * If the error corresponds to autoplay policy restrictions (notable on Safari/iOS),
   * this will show that the player has finished loading and is ready to play.
   * @param {Error} error The error thrown when requesting to play the HTML audio element.
   */
  handlePlayError(error) {
    if (error.name === AUTOPLAY_ERROR_TYPE) {
      this.handlePlaying();
      this.handlePause();
    }
  }
  /**
   * Called when the DFP ad has finished loading.
   * Shows the DFP ad if an ad is actually trafficked to the client.
   * @param {boolean} isAdEmpty Indicates if the DFP ad contains content to show to the user.
   */
  handleDFPAdLoaded(isAdEmpty) {
    if (!isAdEmpty) {
      this.template.showDFPImageAd();
    }
  }
  /**
   * @access private
   * Closes the sideband metadata event source connection when a new stream has loaded.
   */
  closeSBMConnection() {
    if (this.SBMConnection) {
      this.SBMConnection.close();
      this.SBMConnection = undefined;
    }
  }
  /**
   * Called when the sideband metadata event source connection receives a message.
   * Updates the player components when the sideband metadata contains either
   * an ad or track cue point.
   * @param {Object} message JSON object containing sideband metadata.
   */
  onSBMMessage(message) {
    const sbm = JSON.parse(message.data);
    Logger.log("SBM Connection: ", sbm.type, sbm.name);
    this.stationDetails.update(sbm);
    this.adsControls.updateCompanionAd(sbm);
  }
  /**
   * @access private
   * Called when a new station is played.
   * Starts an interval timer which updates the segments of the currently playing show.
   * If the station does not support the interactive player experience,
   * it will not set the interval timer.
   */
  setSegmentsTimer() {
    const isInteractivePlayer = this.dataModel.isInteractivePlayer();
    if (this.segmentsIntervalID && !isInteractivePlayer) {
      clearInterval(this.segmentsIntervalID);
      this.segmentsIntervalID = undefined;
    } else if (!this.segmentsIntervalID && isInteractivePlayer) {
      const timeInMilliseconds = UPDATE_SEGMENTS_MINS * 60 * 1000;
      this.segmentsIntervalID = setInterval(
        this.updateSegments.bind(this),
        timeInMilliseconds
      );
    }
  }
  /**
   * @access private
   * Called when a new station is played.
   * Starts an interval timer which updates the live show details.
   * If the station does support the interactive player experience,
   * it will not set the interval timer.
   */
  setShowTimer() {
    const isInteractivePlayer = this.dataModel.isInteractivePlayer();
    if (!isInteractivePlayer && !this.showIntervalID) {
      const timeInMilliseconds = UPDATE_SHOW_NAME_MINS * 60 * 1000;
      this.showIntervalID = setInterval(
        this.updateShows.bind(this),
        timeInMilliseconds
      );
    } else if (isInteractivePlayer && this.showIntervalID) {
      clearInterval(this.showIntervalID);
      this.showIntervalID = undefined;
    }
  }
  /**
   * @access private
   * Called when a new station is played.
   * Starts an interval timer which updates the components of the player.
   * Only set for stations which support the interactive player experience.
   */
  setSecondsFromLiveTimer() {
    const isInteractivePlayer = this.dataModel.isInteractivePlayer();
    if (isInteractivePlayer && !this.secondsFromLiveTimerID) {
      this.secondsFromLiveTimerID = setInterval(
        this.updateSecondsFromLive.bind(this),
        TIME_UPDATE_DURATION
      );
    } else if (!isInteractivePlayer && this.secondsFromLiveTimerID) {
      clearInterval(this.secondsFromLiveTimerID);
      this.secondsFromLiveTimerID = undefined;
    }
  }
  /**
   * @access private
   * Called when a new station is played.
   * Triggers Comscore analytics logging.
   */
  triggerAnalytics() {
    const genre = this.dataModel.currentStation.attributes.genre[0].name;
    ComscoreHelper.callComscore(genre);
  }
  render() {
    return (
      <div id="playerContainer" className="radio-player-container">
        <div id="companionAd">
          <div id="innerAdDiv" />
        </div>

        <div id="videoAd" />
        <div id="radioPlayerContainer">
          <div id="timelineContainer">
            <div id="timelinePrevButton">
              <div id="timelinePrevIcon" />
            </div>
            <div id="timelineCarousel" class="timelineCarousel" />
            <div id="timelineNextButton">
              <div id="timelineNextIcon" />
            </div>
          </div>
          <div id="scrubBarContainer">
            <div id="cuePointContainer" />
            <div id="dialogBox">
              <div id="liveCircle" />
              <div id="liveText">Live</div>
              <div id="dialogPoint" />
            </div>
            <input
              type="range"
              id="scrubBar"
              name="scrubBar"
              min="0"
              max="100"
              value="0"
              step="0.001"
            />
          </div>
          <div id="radioPlayer">
            <div id="station" class="radioItem">
              <div id="poster" />
              <div id="info">
                <div id="stationNameContainer">
                  <div id="infoOval" />
                  <div id="stationNameWrapper">
                    <div id="stationName" />
                  </div>
                </div>
                <div id="showNameContainer">
                  <div id="showNameWrapper">
                    <div id="showName" />
                  </div>
                </div>
                <div id="showDescriptionContainer">
                  <div id="showDescriptionWrapper">
                    <div id="showDescription" />
                  </div>
                </div>
                <div id="titleArtistContainer">
                  <div id="titleArtistWrapper">
                    <div id="titleArtist" />
                  </div>
                </div>
              </div>
            </div>
            <div id="controls" class="radioItem">
              <div id="prevButton" class="disabled" />
              <div id="rewindButton" class="disabled" />

              <div id="playButtonContainer">
                <div
                  id="playButton"
                  class="disabled"
                  onClick={() => console.log("button on")}
                />
                <div id="loadingSpinner" />
              </div>

              <div id="forwardButton" class="disabled" />
              <div id="nextButton" class="disabled" />
              <audio id="player" controls />
            </div>
            <div id="right" class="radioItem">
              <div id="div-gpt-ad-1532458744047-0" class="dfpAdElement" />
              <div id="liveButton">
                <div id="liveButtonCircle" />
                <div id="liveButtonText">Live</div>
              </div>
              <div id="timelineButton" />
              <div id="muteButton" />
              <div class="toggleContainer">
                <div class="toggleItem" id="toggleMinimizeButton">
                  <div id="minimizeIcon" />
                  <div id="minimizeText">Hide</div>
                </div>
              </div>
            </div>
          </div>
          <div id="minimizedStationContainer" class="hide">
            <div id="oval" />
            <div id="minimizedStationWrapper">
              <div id="minimizedStation" />
            </div>
          </div>
          <div id="minimizedShowContainer" class="hide">
            <div id="minimizedShowWrapper">
              <div id="minimizedShow" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RadioPlayer;
