import {
  AUDIO_PLAYER_ID,
  PLAY_BUTTON_ID,
  BUTTON_DISABLED_CLASS,
  STOP_CLASS,
  NEXT_BUTTON_ID,
  PREV_BUTTON_ID,
  MUTE_BUTTON_ID,
  VOLUME_CONTROL_ID,
  MUTE_CLASS,
  START_VOLUME,
  LIVE_BUTTON_ID,
  LIVE_INACTIVE_CLASS,
  TIMELINE_BUTTON_ID,
  REWIND_BUTTON_ID,
  FORWARD_BUTTON_ID,
  PLAY_BUTTON_CONTAINER_ID,
  LOADING_CLASS
} from "../../constants/player-controls";

export default class PlayerControlsView {
  constructor(dataModel) {
    this.dataModel = dataModel;
    this.loadElements();
  }
  loadElements() {
    this.audioTag = document.getElementById(AUDIO_PLAYER_ID);
    this.playButton = document.getElementById(PLAY_BUTTON_ID);
    // this.playButton = document.getElementById(PLAY_BUTTON_CONTAINER_ID);
    this.nextButton = document.getElementById(NEXT_BUTTON_ID);
    this.prevButton = document.getElementById(PREV_BUTTON_ID);
    this.rewindButton = document.getElementById(REWIND_BUTTON_ID);
    this.forwardButton = document.getElementById(FORWARD_BUTTON_ID);
    this.muteButton = document.getElementById(MUTE_BUTTON_ID);
    this.liveButton = document.getElementById(LIVE_BUTTON_ID);
    this.timelineButton = document.getElementById(TIMELINE_BUTTON_ID);
    this.volumeControl = document.getElementById(VOLUME_CONTROL_ID);
    this.playButtonContainer = document.getElementById(
      PLAY_BUTTON_CONTAINER_ID
    );
    this.originalVolume = START_VOLUME;
  }
  enableControls() {
    this.playButton.classList.remove(BUTTON_DISABLED_CLASS);
    this.togglePrevNext();
    this.toggleRewindForward();
  }
  disableControls() {
    this.playButton.classList.add(BUTTON_DISABLED_CLASS);
    this.nextButton.classList.add(BUTTON_DISABLED_CLASS);
    this.prevButton.classList.add(BUTTON_DISABLED_CLASS);
    this.rewindButton.classList.add(BUTTON_DISABLED_CLASS);
    this.forwardButton.classList.add(BUTTON_DISABLED_CLASS);
  }
  toggleRewindForward() {
    if (this.dataModel.isInteractivePlayer()) {
      this.rewindButton.classList.remove(BUTTON_DISABLED_CLASS);
      this.forwardButton.classList.remove(BUTTON_DISABLED_CLASS);
    } else {
      this.rewindButton.classList.add(BUTTON_DISABLED_CLASS);
      this.forwardButton.classList.add(BUTTON_DISABLED_CLASS);
    }
  }
  togglePrevNext() {
    if (this.dataModel.stationList.length > 1) {
      this.nextButton.classList.remove(BUTTON_DISABLED_CLASS);
      this.prevButton.classList.remove(BUTTON_DISABLED_CLASS);
    } else {
      this.nextButton.classList.add(BUTTON_DISABLED_CLASS);
      this.prevButton.classList.add(BUTTON_DISABLED_CLASS);
    }
  }
  setSrc(streamURL) {
    this.audioTag.src = streamURL;
  }
  showPauseButton() {
    this.playButton.classList.add(STOP_CLASS);
  }
  showPlayButton() {
    this.playButton.classList.remove(STOP_CLASS);
  }
  toggleMute() {
    this.audioTag.muted = !this.audioTag.muted;
    if (this.muteButton.classList.contains(MUTE_CLASS)) {
      this.muteButton.classList.remove(MUTE_CLASS);
      this.setVolume(this.originalVolume);
    } else {
      this.muteButton.classList.add(MUTE_CLASS);
      this.originalVolume = this.volumeControl.value / 100;
      this.setVolume(0, false);
    }
  }
  setVolume(value, setOriginal = true) {
    // value ranges from 0 to 1
    if (value < 0.01) {
      this.audioTag.volume = 0;
      this.volumeControl.value = 0;
    } else if (value >= 1) {
      this.audioTag.volume = 1;
      this.volumeControl.value = 100;
    } else if (!value) {
      this.audioTag.volume = this.volumeControl.value / 100;
    } else {
      this.audioTag.volume = value;
      this.volumeControl.value = value * 100;
    }
    if (setOriginal) {
      this.originalVolume = this.audioTag.volume;
    }

    if (this.audioTag.volume < 0.01) {
      if (!this.muteButton.classList.contains(MUTE_CLASS)) {
        this.muteButton.classList.add(MUTE_CLASS);
      }
    } else {
      this.muteButton.classList.remove(MUTE_CLASS);

      if (this.audioTag.muted) {
        this.audioTag.muted = false;
      }
    }
    this.volumeControl.style.setProperty("--val", +this.volumeControl.value);
  }
  activateLoadingSpinner() {
    this.playButtonContainer.classList.add(LOADING_CLASS);
  }
  deactivateLoadingSpinner() {
    this.playButtonContainer.classList.remove(LOADING_CLASS);
  }
  activateLiveButton() {
    this.liveButton.classList.remove(LIVE_INACTIVE_CLASS);
  }
  deactivateLiveButton() {
    this.liveButton.classList.add(LIVE_INACTIVE_CLASS);
  }
}
