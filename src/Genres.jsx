import React, { Component } from "react";
import "./App.css";
const SpatialNavigation = window.SpatialNavigation;

class Genres extends Component {
  componentDidMount() {
    const selector = `.primary-btn-${this.props.index}`;
    console.log("SELECTOR:", selector);

    SpatialNavigation.add(`channel-${this.props.index}`, {
      selector: selector,
      straightOverlapThreshold: 0.1,
      leaveFor: {
        right: ""
        // down: `@channel-${this.props.index + 1}`,
        // up: `@channel-${this.props.index - 1}`
      }
    });
  }
  render() {
    const stations = this.props.genreObj.station.data.map((station, index) => {
      return index === 0 ? (
        <Station
          station={station}
          updateStation={this.props.updateStation}
          index={this.props.index}
          class={"first"}
        />
      ) : (
        <Station
          station={station}
          updateStation={this.props.updateStation}
          index={this.props.index}
          class={""}
        />
      );
    });
    return (
      <div
        id={`channel-${this.props.index}`}
        className={`channel-container channel-container-${this.props.index}`}
      >
        <h2>{this.props.genreObj.genre.attributes.name}</h2>
        {stations}
      </div>
    );
  }
}

const Station = props => {
  const { station } = props;
  return station ? (
    <button
      className={`primary-btn primary-btn-${props.index} focusable`}
      onClick={() => props.updateStation(station)}
    >
      {station && station.attributes && station.attributes.name}
    </button>
  ) : (
    ""
  );
};

export default Genres;
