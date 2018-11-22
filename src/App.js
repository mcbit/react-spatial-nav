import React, { Component } from "react";
import "./App.css";

class App extends Component {
  componentDidMount() {
    if (!window.RadioPlayer.isInitialized) {
      window.RadioPlayer.initialize();
    }
    const SpatialNavigation = window.SpatialNavigation;

    SpatialNavigation.add(`channel${"1"}`, {
      selector: ".first .focusable",
      leaveFor: { right: `channel${"1"}`, up: "@menu" },
      enterTo: "default-element",
      defaultElement: ".second-button"
    });

    SpatialNavigation.add("channel2", {
      selector: ".second .focusable",
      enterTo: "default-element",
      defaultElement: ".focusable"
    });

    SpatialNavigation.add("menu", {
      selector: ".nav-item",
      leaveFor: { up: "@channel1", right: "@channel2" },
      enterTo: "default-element",
      defaultElement: ".nav-item"
    });
    // Make the *currently existing* navigable elements focusable.
    SpatialNavigation.makeFocusable();

    // Focus the first navigable element.
    SpatialNavigation.focus(" .focusable");
  }

  render() {
    return (
      <div className="App">
        <Navigation />
        <div class="container">
          <div id="channel" className="channel-container first">
            <button
              className="primary-btn focusable"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
            <button
              className="primary-btn focusable second-button"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
            <button
              className="primary-btn focusable"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
            <button
              className="primary-btn focusable"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
            <button
              className="primary-btn focusable"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
            <button
              className="primary-btn focusable"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
            <button
              className="primary-btn focusable"
              onClick={() => console.log("clicked")}
            >
              Demo
            </button>
          </div>
          <div className="channel-container second">
            <button className="primary-btn2 focusable">Row Two</button>
            <button
              className="primary-btn2 focusable"
              onClick={() => console.log("clicked 2")}
            >
              Row Two
            </button>
            <button
              className="primary-btn2 focusable"
              onClick={() => console.log("clicked 2")}
            >
              Row Two
            </button>
            <button
              className="primary-btn2 focusable"
              onClick={() => console.log("clicked 2")}
            >
              Row Two
            </button>
            <button
              className="primary-btn2 focusable"
              onClick={() => console.log("clicked 2")}
            >
              Row Two
            </button>
            <button
              className="primary-btn2 focusable"
              onClick={() => console.log("clicked 2")}
            >
              Row Two
            </button>
            <button
              className="primary-btn2 focusable"
              onClick={() => console.log("clicked 2")}
            >
              Row Two
            </button>
          </div>

          <div id="channel3" className="channel-container channel3">
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked 3")}
            >
              Row 3s
            </button>
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked 3")}
            >
              Row 3s
            </button>
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked 3")}
            >
              Row 3s
            </button>
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked 3")}
            >
              Row 3s
            </button>
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked 3")}
            >
              Row 3s
            </button>
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked")}
            >
              Row 3s
            </button>
            <button
              className="primary-btn3 focusable"
              onClick={() => console.log("clicked")}
            >
              Row 3s
            </button>
          </div>

          <div className="channel-container">
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
            <button
              className="primary-btn4 focusable"
              onClick={() => console.log("clicked 4")}
            >
              Row 4s
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

class Navigation extends Component {
  render() {
    return (
      <div>
        <ul className="navigation-container">
          <li className="nav-item">
            <a href="#" class="nav-link">
              item 1
            </a>
          </li>
          <li className="nav-item">
            <a href="#" class="nav-link">
              item 2
            </a>
          </li>
          <li className="nav-item">
            <a href="#" class="nav-link">
              item 3
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
