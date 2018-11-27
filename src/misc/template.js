const defaultTemplate = `
    <div id="companionAd">
        <div id="innerAdDiv"></div>
    </div>

    <div id="videoAd"></div>
    <div id="radioPlayerContainer">
        <div id="timelineContainer">
            <div id="timelinePrevButton">
                <div id="timelinePrevIcon"></div>
            </div>
            <div id="timelineCarousel" class="timelineCarousel"></div>
            <div id="timelineNextButton">
                <div id="timelineNextIcon"></div>
            </div>
        </div>
        <div id="scrubBarContainer">
            <div id="cuePointContainer"></div>
            <div id="dialogBox">
                <div id="liveCircle"></div>
                <div id="liveText">Live</div>
                <div id="dialogPoint"></div>
            </div>
            <input type="range" id="scrubBar" name="scrubBar" min="0" max="100" value="0" step="0.001" />
        </div>
        <div id="radioPlayer">
            <div id="station" class="radioItem">
                <div id="poster"></div>
                <div id="info">
                    <div id="stationNameContainer">
                        <div id="infoOval"></div>
                        <div id="stationNameWrapper">
                            <div id="stationName"></div>
                        </div>
                    </div>
                    <div id="showNameContainer">
                        <div id="showNameWrapper">
                            <div id="showName"></div>
                        </div>
                    </div>
                    <div id="showDescriptionContainer">
                        <div id="showDescriptionWrapper">
                            <div id="showDescription"></div>
                        </div>
                    </div>
                    <div id="titleArtistContainer">
                        <div id="titleArtistWrapper">
                            <div id="titleArtist"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="controls" class="radioItem">
                <div id="prevButton" class="disabled"></div>
                <div id="rewindButton" class="disabled"></div>

                <div id="playButtonContainer">
                    <div id="playButton" class="disabled"></div>
                    <div id="loadingSpinner"></div>
                </div>


                <div id="forwardButton" class="disabled"></div>
                <div id="nextButton" class="disabled"></div>
                <audio id="player" controls></audio>
            </div>
            <div id="right" class="radioItem">
                <div id="div-gpt-ad-1532458744047-0" class="dfpAdElement"></div>
                <div id="liveButton">
                    <div id="liveButtonCircle"></div>
                    <div id="liveButtonText">Live</div>
                </div>
                <div id="timelineButton"></div>
                <div id="muteButton"></div>
                <input type="range" id="volumeControl" name="volumeControl" min="0" max="100" value="100" step="1" style="--min: 0;--max: 100;--val: 100;"/>
                <div class="toggleContainer">
                    <div class="toggleItem" id="toggleMinimizeButton">
                        <div id="minimizeIcon"></div>
                        <div id="minimizeText">Hide</div>
                    </div>
                </div>
            </div>
        </div>
        <div id="minimizedStationContainer" class="hide">
            <div id="oval"></div>
            <div id="minimizedStationWrapper">
                <div id="minimizedStation"></div>
            </div>
        </div>
        <div id="minimizedShowContainer" class="hide">
            <div id="minimizedShowWrapper">
                <div id="minimizedShow"></div>
            </div>
        </div>
    </div>`;

export default defaultTemplate;
