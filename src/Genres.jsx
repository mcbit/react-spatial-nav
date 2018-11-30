import React, { Component } from "react";
import $ from "jquery";
import "owl.carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "./App.css";

const SpatialNavigation = window.SpatialNavigation;
class Genres extends Component {
  state = {
    currentIndex: 0
  };
  componentDidMount() {
    const selector = `.primary-btn-${this.props.index}`;

    SpatialNavigation.add(`channel-${this.props.index}`, {
      selector: selector,
      straightOverlapThreshold: 0.1,
      leaveFor: {
        right: "",
        left: ""
        // down: `@channel-${this.props.index + 1}`,
        // up: `@channel-${this.props.index - 1}`
      }
    });

    $(document).ready(() => {
      $(`.channel-container-${this.props.index}`).owlCarousel({
        autoWidth: true,
        margin: 10
      });
    });
  }

  onStationFocus = (e, index) => {
    const owl = $(`.channel-container-${this.props.index}`);

    if (this.state.currentIndex < index) {
      owl.trigger("next.owl.carousel");
    } else {
      owl.trigger("prev.owl.carousel");
    }

    this.setState({
      currentIndex: index
    });

    // console.log("FOCUS ", owl);

    // const stationContainer = document.getElementById(
    //   `channel-${this.props.index}`
    // );
    // const currentStation = document.getElementById(e.target.id);

    // const xVal = currentStation.offsetLeft;

    // stationContainer.style.transition = "0.5s ease-out";
    // stationContainer.style.transform = "translateX(-" + xVal + "px)";
  };

  render() {
    const stations = this.props.genreObj.station.data.map((station, index) => {
      return index === 0 ? (
        <Station
          station={station}
          updateStation={this.props.updateStation}
          onStationFocus={this.onStationFocus}
          rowIndex={this.props.index}
          stationIndex={index}
          class={"first"}
        />
      ) : (
        <Station
          station={station}
          updateStation={this.props.updateStation}
          rowIndex={this.props.index}
          stationIndex={index}
          onStationFocus={this.onStationFocus}
          class={""}
        />
      );
    });
    return (
      <div
        id={`channel-${this.props.index}`}
        className={`owl-carousel channel-container channel-container-${
          this.props.index
        }`}
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
      onFocus={e => props.onStationFocus(e, props.stationIndex)}
      id={`primary-btn-${props.rowIndex}${props.stationIndex}`}
      className={`primary-btn primary-btn-${props.rowIndex} focusable`}
      onClick={() => props.updateStation(station)}
    >
      <object
        className="stationimg"
        data={station.attributes.square_logo_large}
        type="image/png"
      >
        <img src="https://via.placeholder.com/400" alt="example" />
      </object>
      {/* {station && station.attributes && station.attributes.name} */}
    </button>
  ) : (
    ""
  );
};

export default Genres;
