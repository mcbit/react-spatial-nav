import React, { Component } from "react";
import Genres from "./Genres";
import RadioPlayer from "./RadioPlayer";
import { getGenres, getStationsByGenre } from "./utils/api";
import "./App.css";

class App extends Component {
  state = {
    genres: [],
    data: [],
    station: null
  };

  componentDidMount() {
    getGenres().then(({ data }) => this.setState({ genres: data }));

    // if (!window.RadioPlayer.isInitialized) {
    //   window.RadioPlayer.initialize();
    // }
    const SpatialNavigation = window.SpatialNavigation;

    SpatialNavigation.add("menu", {
      selector: ".nav-item",
      enterTo: "default-element",
      defaultElement: ".nav-item"
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

  updateStation = station => {
    this.setState({ station }, () => console.log("stateupdated"));
  };

  retrieveStations = () =>
    this.state.genres.map(genre => getStationsByGenre(genre.id));

  render() {
    const genres = this.state.data.map((genreObj, index) => (
      <Genres
        index={index}
        genreObj={genreObj}
        updateStation={this.updateStation}
      />
    ));

    return (
      <div className="App">
        <Navigation />
        <div class="container">{genres}</div>
        {this.state.station && <RadioPlayer station={this.state.station} />}
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
