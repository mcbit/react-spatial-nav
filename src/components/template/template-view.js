import {
  TEMPLATE_ID,
  TEMPLATE_TYPE,
  POPUP_CLASS,
  PLAYER_CONTAINER_ID,
  RADIO_PLAYER_CONTAINER_ID,
  TOGGLE_MINIMIZE_BUTTON_ID,
  SHOW_INTERACTIVE_PLAYER_CLASS,
  SHOW_TIMELINE_CLASS,
  HIDE_TIMELINE_CLASS,
  TIMELINE_CONTAINER_ID,
  SHOW_AD_CLASS
} from "../../constants/template";
import { AUDIO_CATEGORY_LIST } from "../../constants/main";
import MarqueeHelper from "../../utils/marquee-helper";
import {
  FORWARD_BUTTON_ID,
  REWIND_BUTTON_ID
} from "../../constants/player-controls";

export default class TemplateView {
  // injectTemplate() {
  //   const templateHTML = document.createElement('script');
  //   templateHTML.id = TEMPLATE_ID;
  //   templateHTML.type = TEMPLATE_TYPE;
  //   templateHTML.innerHTML = innerHTML;
  //   document.body.appendChild(templateHTML);
  // }
  injectPlayer() {
    //   Logger.log('injecting player');
    // const source = document.getElementById(TEMPLATE_ID).innerHTML;
    // const hbTemplate = Handlebars.compile(source);
    const data = {
      stationName: "",
      showName: ""
    };
    // const html = hbTemplate(data);
    this.playerContainer = document.getElementById(PLAYER_CONTAINER_ID);
    // this.playerContainer.innerHTML = html;
  }
  loadElements() {
    this.radioPlayerContainer = document.getElementById(
      RADIO_PLAYER_CONTAINER_ID
    );
    this.toggleMinimizeButton = document.getElementById(
      TOGGLE_MINIMIZE_BUTTON_ID
    );
    this.timelineContainer = document.getElementById(TIMELINE_CONTAINER_ID);
    this.minimizeText = document.getElementById("minimizeText");
    this.stationEl = document.getElementById("station");
    this.volumeControlEl = document.getElementById("volumeControl");
    this.prevEl = document.getElementById("prevButton");
    this.nextEl = document.getElementById("nextButton");
    this.forwardButton = document.getElementById(FORWARD_BUTTON_ID);
    this.rewindButton = document.getElementById(REWIND_BUTTON_ID);
    this.marqueeTextEl = document.getElementById("minimizedShowContainer");
    this.minimizedStationContainer = document.getElementById(
      "minimizedStationContainer"
    );
    this.companionAd = document.getElementById("companionAd");
    this.videoAd = document.getElementById("videoAd");
  }
  addPopupClass() {
    this.radioPlayerContainer.classList.add(POPUP_CLASS);
  }
  removeCategoryClasses() {
    for (let i = 0; i < AUDIO_CATEGORY_LIST.length; i++) {
      this.radioPlayerContainer.classList.remove(AUDIO_CATEGORY_LIST[i]);
    }
  }
  addCategoryClass(categoryClass) {
    this.radioPlayerContainer.classList.add(categoryClass);
  }
  addShowAdClass() {
    this.radioPlayerContainer.classList.add(SHOW_AD_CLASS);
  }
  switchToCollapsedView() {
    this.toggleMinimizeButton.classList.remove("minimized");
    this.radioPlayerContainer.classList.remove("minimized");
    this.stationEl.classList.remove("hide");
    this.volumeControlEl.classList.remove("hide");
    this.prevEl.classList.remove("hide");
    this.nextEl.classList.remove("hide");
    this.forwardButton.classList.remove("hide");
    this.rewindButton.classList.remove("hide");
    this.minimizedStationContainer.classList.add("hide");
    this.marqueeTextEl.classList.add("hide");
    this.minimizeText.innerHTML = "Hide";
    this.companionAd.classList.remove("moveAdDown");
    this.videoAd.classList.remove("moveAdDown");
  }
  switchToMinimizedView() {
    this.toggleMinimizeButton.classList.add("minimized");
    this.radioPlayerContainer.classList.add("minimized");
    this.stationEl.classList.add("hide");
    this.volumeControlEl.classList.add("hide");
    this.prevEl.classList.add("hide");
    this.nextEl.classList.add("hide");
    this.forwardButton.classList.add("hide");
    this.rewindButton.classList.add("hide");
    this.marqueeTextEl.classList.remove("hide");
    this.minimizedStationContainer.classList.remove("hide");
    this.minimizeText.innerHTML = "Expand";
    this.companionAd.classList.add("moveAdDown");
    this.videoAd.classList.add("moveAdDown");

    MarqueeHelper.updateMinimizedMarquee();
  }
  toggleInteractivePlayer(isInteractivePlayer) {
    if (isInteractivePlayer) {
      this.playerContainer.classList.add(SHOW_INTERACTIVE_PLAYER_CLASS);
    } else {
      this.playerContainer.classList.remove(SHOW_INTERACTIVE_PLAYER_CLASS);
      this.playerContainer.classList.remove(SHOW_TIMELINE_CLASS);
    }
  }
  toggleTimeline() {
    if (this.isTimelineShown()) {
      this.playerContainer.classList.remove(SHOW_TIMELINE_CLASS);
      this.timelineContainer.classList.add(HIDE_TIMELINE_CLASS);
    } else {
      this.playerContainer.classList.add(SHOW_TIMELINE_CLASS);
      this.timelineContainer.classList.remove(HIDE_TIMELINE_CLASS);
    }
  }
  isTimelineShown() {
    return this.playerContainer.classList.contains(SHOW_TIMELINE_CLASS);
  }
}
