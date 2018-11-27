import Hls from "hls.js";
import PlayerControlsView from "./player-controls-view";
import Logger from "../../utils/logger";
import {
  LIST_DIRECTION,
  BUTTON_DISABLED_CLASS,
  STREAM_DIRECTION,
  HLS_MEDIA_ERROR,
  HLS_BUFFER_ERROR
} from "../../constants/player-controls";
import { SUPPORTS_NATIVE_HLS } from "../../constants/main";

export default class PlayerControlsController {
  constructor(player) {
    this.player = player;
    this.dataModel = player.dataModel;
    this.hls = undefined;
    this.autoplay = true;
    this.view = new PlayerControlsView(this.player.dataModel);

    this.view.loadElements();
    this.loadAudioEvents();
    this.loadButtonEvents();
  }
  loadAudioEvents() {
    this.view.audioTag.addEventListener(
      "playing",
      this.player.handlePlaying.bind(this.player)
    );
    this.view.audioTag.addEventListener(
      "pause",
      this.player.handlePause.bind(this.player)
    );
    this.view.audioTag.addEventListener(
      "volumechange",
      this.handleVolumeChange.bind(this)
    );
    this.view.audioTag.addEventListener(
      "loadstart",
      this.handleLoadStart.bind(this)
    );
    this.view.audioTag.addEventListener(
      "loadedmetadata",
      this.player.handleLoadedMetaData.bind(this.player)
    );
    this.view.audioTag.addEventListener(
      "error",
      this.player.handleMediaError.bind(this.player)
    );
    this.view.audioTag.addEventListener(
      "ended",
      this.player.handleStreamEnded.bind(this.player)
    );
  }
  loadButtonEvents() {
    this.view.playButton.addEventListener("click", this.togglePlay.bind(this));
    this.view.playButton.addEventListener("sn:enter-down", function() {
      console.log("hello");
    });
    this.view.prevButton.addEventListener("click", this.prev.bind(this));
    this.view.nextButton.addEventListener("click", this.next.bind(this));
    this.view.forwardButton.addEventListener("click", this.forward.bind(this));
    this.view.rewindButton.addEventListener("click", this.rewind.bind(this));
    this.view.muteButton.addEventListener(
      "click",
      this.view.toggleMute.bind(this.view)
    );
    this.view.liveButton.addEventListener(
      "click",
      this.player.handleLivePlay.bind(this.player)
    );
    this.view.timelineButton.addEventListener(
      "click",
      this.player.handleTimelineClick.bind(this.player)
    );
    // this.view.volumeControl.addEventListener('input', () => { this.view.setVolume(); });
    // this.view.volumeControl.addEventListener('change', () => { this.view.setVolume(); });
  }
  loadStream(autoplay = true) {
    this.autoplay = autoplay;
    this.view.enableControls();
    if (this.dataModel.isLiveStream()) {
      this.loadLiveStream();
    } else {
      this.loadAiredStream();
    }
  }
  loadLiveStream() {
    const { streamURL } = this.dataModel;
    Logger.log("LOADING LIVE STREAM", streamURL);
    this.view.setSrc(streamURL);
    this.play();
    this.view.activateLiveButton();
  }
  loadAiredStream() {
    const { streamURL } = this.dataModel;
    Logger.log("LOADING HLS STREAM", streamURL);
    this.destroyStream();
    if (this.isHLSLibrarySupported()) {
      this.loadHlsLibraryStream(streamURL);
    } else if (this.isNativeHLSSupported()) {
      Logger.log("Browser supports native HLS");
      this.loadNativeHlsStream(streamURL);
    } else {
      Logger.log("Browser does not support MediaSource API or native HLS");
    }
    this.view.deactivateLiveButton();
  }
  loadHlsLibraryStream(streamURL) {
    const self = this;
    this.hls = new Hls();
    this.hls.attachMedia(this.view.audioTag);
    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      self.hls.loadSource(streamURL);
    });
    this.hls.on(Hls.Events.MANIFEST_LOADED, () => {
      self.play();
    });
    this.hls.on(Hls.Events.ERROR, (event, data) => {
      Logger.error("HLS ERROR", event, data);
      const isAudioBufferError =
        data.type === HLS_MEDIA_ERROR && data.details === HLS_BUFFER_ERROR;
      if (isAudioBufferError) {
        self.hls.swapAudioCodec();
        self.hls.recoverMediaError();
      }
    });
  }
  loadNativeHlsStream(streamURL) {
    this.view.setSrc(streamURL);
    this.view.audioTag.load();
    this.play();
  }
  destroyStream() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.view.setSrc("");
    this.view.audioTag.load();
  }
  handlePlaying() {
    this.disable();
    this.view.showPauseButton();
  }
  handlePause() {
    this.view.showPlayButton();
  }
  handleVolumeChange() {
    if (
      Math.abs(
        this.view.audioTag.volume - this.view.volumeControl.value / 100
      ) > 0.01
    ) {
      this.view.audioTag.volume = this.view.volumeControl.value / 100;
    }
  }
  handleLoadStart() {
    if (this.dataModel.isLiveStream()) {
      this.play();
    }
  }
  prev(event) {
    if (!this.isActionDisabled(event)) {
      this.player.updateStation(LIST_DIRECTION.prev);
    }
  }
  next(event) {
    if (!this.isActionDisabled(event)) {
      this.player.updateStation(LIST_DIRECTION.next);
    }
  }
  forward(event) {
    if (!this.isActionDisabled(event)) {
      this.player.handleStreamSeek(STREAM_DIRECTION.forward);
    }
  }
  rewind(event) {
    if (!this.isActionDisabled(event)) {
      this.player.handleStreamSeek(STREAM_DIRECTION.rewind);
    }
  }
  togglePlay(event) {
    console.log("clicked on enter");
    if (!this.isActionDisabled(event)) {
      if (this.isPlaying()) {
        this.view.audioTag.pause();
      } else {
        this.view.audioTag.play();
      }
    }
  }
  disable() {
    if (this.player.isAdPlaying) {
      this.pause();
      this.view.disableControls();
    }
  }
  enable() {
    this.play();
    this.view.enableControls();
  }
  play() {
    if (this.autoplay) {
      const self = this;
      const playPromise = this.view.audioTag.play();
      if (playPromise) {
        playPromise.catch(error => self.player.handlePlayError(error));
      }
    } else {
      this.pause();
    }
  }
  pause() {
    this.view.audioTag.pause();
  }
  startLoadingSpinner() {
    this.view.activateLoadingSpinner();
  }
  stopLoadingSpinner() {
    this.view.deactivateLoadingSpinner();
  }
  isActionDisabled(event) {
    const button = event.target || event.srcElement;
    const isButtonDisabled = button.classList.contains(BUTTON_DISABLED_CLASS);
    return this.player.isAdPlaying || isButtonDisabled;
  }
  isHLSLibrarySupported() {
    return Hls.isSupported();
  }
  isNativeHLSSupported() {
    return SUPPORTS_NATIVE_HLS;
  }
  isPlaying() {
    return !this.view.audioTag.paused;
  }
}
