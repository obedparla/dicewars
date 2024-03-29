import React, { Component } from "react";
import classNames from "classnames";
import "./App.css";
import { Hexagon } from "./components/Hexagon";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sectionHovered: 0,
      sectionClicked: 0,
      masterMatrix: [],
      sectionsObject: {},
      activePlayer: "1",
    };
    this.highlightSection = this.highlightSection.bind(this);
    this.selectSection = this.selectSection.bind(this);
    this.checkAllowedHover = this.checkAllowedHover.bind(this);
    this.conquerNewSection = this.conquerNewSection.bind(this);
    this.rollDices = this.rollDices.bind(this);
    this.passTurn = this.passTurn.bind(this);
  }

  componentDidMount() {
    const populatedInfo = populateMap(33, 18);
    this.setState({
      masterMatrix: populatedInfo[0],
      sectionsObject: populatedInfo[1],
    });
  }

  // * Check if the current section is adjacent to the clicked section.
  checkAllowedHover(sectionID, sectionPositions) {
    const { masterMatrix, sectionClicked } = this.state;
    const maxQ = masterMatrix[0].length - 1,
      maxI = masterMatrix.length - 1;
    // Player needs to hover over the non clicked section and over it's own sections.
    if (getPlayerID(sectionID) === getPlayerID(sectionClicked)) {
      return false;
    }

    // Go through all the section positions.
    for (let pos = 0; pos < Object.keys(sectionPositions).length; pos++) {
      let { i, q } = sectionPositions[pos];

      // Check top top, bottom, left and right positions to see if current element is adjacent to clicked section
      // Doing a ternary operation on each to make sure we're not going outside the boundaries of the matrix.
      if (
        masterMatrix[i === 0 ? 0 : i - 1][q] === sectionClicked ||
        masterMatrix[i === maxI ? maxI : i + 1][q] === sectionClicked ||
        masterMatrix[i][q === 0 ? 0 : q - 1] === sectionClicked ||
        masterMatrix[i][q === maxQ ? maxQ : q + 1] === sectionClicked
      ) {
        return true;
      }
    }

    return false;
  }

  highlightSection(sectionID) {
    this.setState((prevState) => {
      const { sectionClicked, sectionsObject, activePlayer } = prevState;

      //Active player can only hover its own sections
      if (
        (activePlayer !== getPlayerID(sectionID) && sectionClicked === 0) ||
        (sectionsObject[sectionID].towersValue === 1 &&
          getPlayerID(sectionID) === activePlayer)
      ) {
        return { sectionHovered: 0 };
      }

      // If there's no section clicked or the hover is allowed (when a section is clicked)
      if (
        sectionClicked === 0 ||
        this.checkAllowedHover(sectionID, sectionsObject[sectionID].positions)
      ) {
        return { sectionHovered: sectionID };
      } else {
        return { sectionHovered: 0 };
      }
    });
  }

  selectSection(sectionID) {
    this.setState((prevState) => {
      const { sectionClicked, sectionHovered, activePlayer, sectionsObject } =
        prevState;

      if (
        sectionClicked === sectionID ||
        (sectionsObject[sectionID].towersValue === 1 &&
          getPlayerID(sectionID) === activePlayer)
      )
        return { sectionClicked: 0 };
      else if (sectionClicked !== 0 && sectionID === sectionHovered) {
        this.conquerNewSection(sectionID);
        return { sectionClicked: 0 };
      } else if (activePlayer !== getPlayerID(sectionID)) {
        return { sectionClicked: sectionClicked }; // If click is on a non-player section, leave the same section clicked
      } else return { sectionClicked: sectionID };
    });
  }

  conquerNewSection(sectionID) {
    const { sectionsObject, masterMatrix, sectionClicked } = this.state,
      changedTeam = changeTeam(sectionID);

    // Roll the dices, challenger wins returns true.
    if (this.rollDices(sectionID)) {
      // Change the values of the matrix.
      for (let index in sectionsObject[sectionID].positions) {
        const { i, q } = sectionsObject[sectionID].positions[index];
        masterMatrix[i][q] = changedTeam;
      }

      // Add a new object with the new changedTeam ID, it must have the same properties as the previous one.
      // Then delete the old ID.
      sectionsObject[changedTeam] = sectionsObject[sectionID];
      delete sectionsObject[sectionID];

      // Attacker towers = 1 and attacked section = all of the attacker's - 1
      sectionsObject[changedTeam].towersValue =
        sectionsObject[sectionClicked].towersValue - 1;
      sectionsObject[sectionClicked].towersValue = 1;

      this.setState({
        masterMatrix: masterMatrix,
        sectionsObject: sectionsObject,
      });
    } else {
      // The challenger lost, leave it with only 1 tower
      sectionsObject[sectionClicked].towersValue = 1;
      this.setState({ sectionsObject: sectionsObject });
    }
  }

  rollDices(sectionID) {
    const { sectionClicked, sectionsObject } = this.state,
      valueTeam1 = getRandomInt(
        1,
        sectionsObject[sectionClicked].towersValue * 10,
      ),
      valueTeam2 = getRandomInt(1, sectionsObject[sectionID].towersValue * 10);
    return valueTeam1 > valueTeam2;
  }

  passTurn() {
    const { activePlayer } = this.state;
    this.setState({ activePlayer: activePlayer === "1" ? "2" : "1" });
  }

  render() {
    const {
      masterMatrix,
      sectionHovered,
      sectionClicked,
      sectionsObject,
      activePlayer,
    } = this.state;
    const addedTowerValues = [];

    return (
      <div className={"app_container"}>
        {masterMatrix.map((row, index) => {
          const hexagonContClass = classNames("hexagon-row", {
            even: index % 2 === 0,
          });

          return (
            <div className={hexagonContClass}>
              {row.map((sectionID, index) => {
                const hexagonClass = classNames(
                  "hexagon",
                  sectionID,
                  "team-" + getPlayerID(sectionID),
                  "group-" + getGroupNumber(sectionID),
                  { "hovered-section": sectionHovered === sectionID },
                  { "clicked-section": sectionClicked === sectionID },
                );

                let children = "";

                if (
                  addedTowerValues.indexOf(sectionsObject[sectionID]) === -1
                ) {
                  addedTowerValues.push(sectionsObject[sectionID]);
                  children = sectionsObject[sectionID].towersValue;
                }

                return (
                  <Hexagon
                    key={sectionID + "" + index}
                    classNam={hexagonClass}
                    onClick={() => this.selectSection(sectionID)}
                    onMouseOver={() => this.highlightSection(sectionID)}
                    children={children}
                  />
                );
              })}
            </div>
          );
        })}
        <div className="clearfix"></div>
        <div className="info_container">
          <div className="info_container__turn">
            <Hexagon classNam={"hexagon team-" + activePlayer}></Hexagon>

            <div className="turn_info">
              <span>{`Player ${
                activePlayer === "1" ? "one" : "two"
              } turn`}</span>

              <button
                type="button"
                id="pass-turn"
                className={`finish_turn player_${
                  activePlayer === "1" ? "one" : "two"
                }`}
                onClick={() => this.passTurn()}
              >
                Finish turn
              </button>
            </div>
          </div>

          <div className="info_container__how-to-play">
            <ul>
              <li>Click on a a hex section, and then click on the enemy's</li>
              <li>
                Each section has "points" and the higher against the opponent's
                section, the more likely to win
              </li>
              <li>Each player turn has as many moves as possible</li>
              <li>Pass your turn when you're ready</li>
            </ul>
          </div>

          <div className="info_container__author">
            Made by{" "}
            <a href={"https://obedparla.com"} target={"_blank"}>
              Obed Parlapiano
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const changeTeam = (sectionID) => {
  const newSectionID = "" + sectionID;
  const newID = newSectionID[0] === "1" ? "2" : "1";

  return newID + newSectionID.substr(1);
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

const checkSpaceLeftMatrix = (matrix) => {
  const height = matrix.length,
    width = matrix[0].length;
  for (let i = 0; i < height; i++) {
    for (let q = 0; q < width; q++) {
      if (matrix[i][q] === 0) {
        return true;
      }
    }
  }

  return false;
};

const populateMap = (width, height, playerCounterMultiplier = 1000) => {
  const sectionMaxWidth = 6,
    sectionMaxHeight = 4,
    sectionsObject = {};
  let masterMatrix = createMasterMatrix(width, height);
  // Create the player 1 and 2 counters. number they must start with number 1 and 2 to identify
  let playerOneID_counter = playerCounterMultiplier,
    playerTwoID_counter = 2 * playerCounterMultiplier;

  let counter = 1;
  // Fill the matrix until there's no space left
  while (checkSpaceLeftMatrix(masterMatrix)) {
    const randPlayerID = getRandomInt(1, 3), // get 1 or 2 randomly
      sectionHeight = getRandomInt(2, sectionMaxHeight);
    const currentPlayerID =
      randPlayerID === 1
        ? playerOneID_counter + counter
        : playerTwoID_counter + counter;
    let currentHeight = 0,
      sectionCounter = 0;

    counter++;
    sectionsObject[currentPlayerID] = {};
    sectionsObject[currentPlayerID].towersValue = getRandomInt(1, 9);
    sectionsObject[currentPlayerID].positions = {};

    //In case something goes wrong and the loop never ends
    if (counter === 1000) {
      console.error("Populate map overflow");
      return false;
    }

    for (let i = 0; i < height; i++) {
      const sectionWidth = getRandomInt(2, sectionMaxWidth);
      let currentWidth = 0,
        addedValue = false;

      for (let q = 0; q < width; q++) {
        if (masterMatrix[i][q] === 0) {
          // If we've added a row already, check the item above to make sure it belongs to the same section. This makes sure the section is connected. Continue if not.
          if (currentHeight > 0 && masterMatrix[i - 1][q] !== currentPlayerID) {
            continue;
          }
          if (
            currentWidth > 0 &&
            q > 0 &&
            masterMatrix[i][q - 1] !== currentPlayerID
          ) {
            continue;
          }

          masterMatrix[i][q] = currentPlayerID;
          sectionsObject[currentPlayerID].positions[sectionCounter] = {};
          sectionsObject[currentPlayerID].positions[sectionCounter].i = i;
          sectionsObject[currentPlayerID].positions[sectionCounter].q = q;
          currentWidth++;
          sectionCounter++;
          addedValue = true;
        }

        if (currentWidth === sectionWidth) {
          break;
        }
      }

      if (addedValue) {
        currentHeight++;
      }
      if (currentHeight === sectionHeight) {
        break;
      }
    }
  }

  return [masterMatrix, sectionsObject];
};

// Divides the player id for that place (e.j 2005) to the counterMultiplier (1000). Get the integer that is the player ID with ~~ (2)
// const comparePlayersInMatrix = (currentPlayer, toCompareWithPlayer, playerCounterMultiplier) =>
// ~~(currentPlayer / playerCounterMultiplier) === ~~(toCompareWithPlayer / playerCounterMultiplier);

const getPlayerID = (currentPlayerID) => {
  let string = "" + currentPlayerID;
  return string[0];
};

const getGroupNumber = (currentPlayerID) => {
  let string = "" + currentPlayerID;
  // In case the group number is above 9
  if (string[string.length - 2] !== "0")
    return string[string.length - 2] + string[string.length - 1];
  return string[string.length - 1];
};

const createMasterMatrix = (width, height) => {
  let masterMatrix = [];

  for (let i = 0; i < height; i++) {
    masterMatrix[i] = [];
    for (let q = 0; q < width; q++) {
      masterMatrix[i][q] = 0;
    }
  }

  return masterMatrix;
};

export default App;
