import React, { Component } from "react";
import Genres from "./Genres";
import { getGenres, getStationsByGenre } from "./utils/api";
import "./App.css";

class App extends Component {
  state = {
    genres: [],
    data: []
  };

  componentDidMount() {
    getGenres().then(({ data }) => this.setState({ genres: data }));

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
      leaveFor: { up: "@channel1", right: "@channel2", down: "" },
      enterTo: "default-element",
      defaultElement: ".nav-item"
    });

    SpatialNavigation.add("playButton", {
      selector: "#playButton",
      leaveFor: { up: "@menu" }
    });

    // Make the *currently existing* navigable elements focusable.
    SpatialNavigation.makeFocusable();

    // Focus the first navigable element.
    SpatialNavigation.focus(" .focusable");
  }

  componentDidUpdate(prevProp, prevState) {
    if (prevState.genres !== this.state.genres) {
      const stations = Promise.all(this.retrieveStations()).then(data => {
        const obj = data.map((station, i) => ({
          genre: this.state.genres[i],
          station
        }));
        this.setState({ data: obj });
      });
    }
  }

  retrieveStations = () =>
    this.state.genres.map(genre => getStationsByGenre(genre.id));

  render() {
    const genres = this.state.data.map(genreObj => (
      <Genres genreObj={genreObj} />
    ));

    return (
      <div className="App">
        <Navigation />
        <div class="container">{genres}</div>
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
