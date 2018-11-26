import React, { Component } from "react";
import "./App.css";

class Genres extends Component {
  render() {
    const stations = this.props.genreObj.station.data.map(station => (
      <Station station={station} />
    ));
    return (
      <div id="channel" className="channel-container first">
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
      className="primary-btn focusable"
      onClick={() => window.RadioPlayer.updateStationList(station, 0)}
    >
      {station && station.attributes && station.attributes.name}
    </button>
  ) : (
    ""
  );
};

export default Genres;
