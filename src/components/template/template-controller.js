import TemplateView from "./template-view";

export default class TemplateController {
  constructor(player) {
    this.player = player;
    this.dataModel = player.dataModel;
    this.view = new TemplateView();
  }
  load() {
    this.view.injectPlayer();
    this.view.loadElements();
    this.loadEvents();
  }
  loadEvents() {
    this.view.toggleMinimizeButton.addEventListener(
      "click",
      this.toggleMinimize.bind(this)
    );
  }
  popup() {
    this.view.addPopupClass();
  }
  setCategory() {
    const { category } = this.dataModel.currentStation.attributes;
    this.view.removeCategoryClasses();
    this.view.addCategoryClass(category.toLowerCase());
  }
  toggleMinimize() {
    if (this.view.toggleMinimizeButton.classList.contains("minimized")) {
      this.view.switchToCollapsedView();
    } else {
      this.view.switchToMinimizedView();
    }
  }
  toggleInteractivePlayer() {
    this.view.toggleInteractivePlayer(this.dataModel.isInteractivePlayer());
  }
  toggleTimeline() {
    this.view.toggleTimeline();
  }
  showDFPImageAd() {
    this.view.addShowAdClass();
  }
}
