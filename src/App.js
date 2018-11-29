import React, { Component, Fragment } from "react";
import { Link, Switch, Route } from "react-router-dom";
import Genres from "./Genres";
import Settings from "./components/setting";
import RadioPlayer from "./RadioPlayer";
import { getGenres, getStationsByGenre } from "./utils/api";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navigation />
        <Switch>
          <Route path="/settings" component={Settings} />
          <Route exact path="/" component={Home} />
          <Route path="/" componen={Home} />
        </Switch>
      </div>
    );
  }
}

export default App;

class Home extends Component {
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
      <Fragment>
        <div class="container">{genres}</div>
        {this.state.station && <RadioPlayer station={this.state.station} />}
      </Fragment>
    );
  }
}
class Navigation extends Component {
  render() {
    return (
      <div>
        <ul className="navigation-container">
          <Link to="/" className="nav-item nav-link">
            Search
          </Link>
          <Link to="/stations" className="nav-item nav-link">
            Stations
          </Link>
          <Link to="/settings" className="nav-item nav-link">
            Settings
          </Link>
          <Link to="/player" className="nav-item nav-link">
            Player
          </Link>
        </ul>
      </div>
    );
  }
}
