import React, {Component} from 'react';
import classNames from 'classnames';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            sectionHovered: 0,
            sectionClicked: 0,
            masterMatrix: [],
            sectionsObject: {}
        };
        this.highlightSection = this.highlightSection.bind(this);
        this.selectSection = this.selectSection.bind(this);
        this.checkAllowedHover = this.checkAllowedHover.bind(this);
        this.conquerNewSection = this.conquerNewSection.bind(this);
        this.rollDices = this.rollDices.bind(this);
    }

    componentDidMount() {
        const populatedInfo = populateMap(33, 18);
        this.setState({masterMatrix: populatedInfo[0], sectionsObject: populatedInfo[1]});
    }

    // * Check if the current section is adjacent to the clicked section.
    checkAllowedHover(sectionID, sectionPositions) {
        const {masterMatrix, sectionClicked, sectionHovered} = this.state;
        // console.log(sectionPositions);
        const maxQ = masterMatrix[0].length - 1,
            maxI = masterMatrix.length - 1
        ;

        // Check that hovered section belongs to the opposite team
        if (getPlayerID(sectionID) === getPlayerID(sectionClicked)) {
            return false;
        }

        // Go through all the section positions.
        for (let pos = 0; pos < Object.keys(sectionPositions).length; pos++) {
            let {i, q} = sectionPositions[pos];

            // console.log("i-1: " + masterMatrix[i === 0 ? 0 : i-1][q]);
            // console.log("i+1: " + masterMatrix[i === maxI ? maxI : i+1][q]);
            // console.log("q+1: " + masterMatrix[i][masterMatrix[q === maxQ ? maxQ : q+1]]);
            // console.log("q-1 " + masterMatrix[i][q === 0 ? 0 : q-1][q]);

            // Check top top, bottom, left and right positions to see if current element is adjacent to clicked section
            // Doing a ternary operation on each to make sure we're not going outside the boundaries of the matrix.
            if (masterMatrix[i === 0 ? 0 : i - 1][q] === sectionClicked || masterMatrix[i === maxI ? maxI : i + 1][q] === sectionClicked ||
                masterMatrix[i][q === 0 ? 0 : q - 1] === sectionClicked || masterMatrix[i][q === maxQ ? maxQ : q + 1] === sectionClicked) {
                return true
            }
        }

        return false;
    }


    highlightSection(sectionID) {
        this.setState((prevState) => {
            const {sectionClicked, sectionsObject, masterMatrix} = prevState;

            // If there's no section clicked or the hover is allowed (when a section is clicked)
            // console.log(sectionsObject[sectionID].positions);
            if (sectionClicked === 0 || this.checkAllowedHover(sectionID, sectionsObject[sectionID].positions)) {
                return {sectionHovered: sectionID}
            } else {
                return {sectionHovered: 0}
            }

        });
    }

    selectSection(sectionID) {
        this.setState((prevState) => {
            const {sectionClicked, sectionHovered} = prevState;

            if (sectionClicked === sectionID)
                return {sectionClicked: 0};
            else if (sectionClicked !== 0 && sectionID === sectionHovered) {
                this.conquerNewSection(sectionID);
                return {sectionClicked: 0}
            }
            else
                return {sectionClicked: sectionID};
        });
    }

    conquerNewSection(sectionID) {
        const {sectionsObject, masterMatrix, sectionClicked} = this.state,
            changedTeam = changeTeam(sectionID);

        // Roll the dices, challenger wins returns true.
        if (this.rollDices(sectionID)) {

            // Change the values of the matrix.
            for (let index in sectionsObject[sectionID].positions) {
                const {i, q} = sectionsObject[sectionID].positions[index];
                masterMatrix[i][q] = changedTeam;
            }

            // Add a new object with the new changedTeam ID, it must have the same properties as the previous one.
            // Then delete the old ID.
            sectionsObject[changedTeam] = sectionsObject[sectionID];
            delete sectionsObject[sectionID];

            // Attacker towers = 1 and attacked section = all of the attacker's - 1
            sectionsObject[changedTeam].towersValue = sectionsObject[sectionClicked].towersValue -1;
            sectionsObject[sectionClicked].towersValue = 1;


            this.setState({masterMatrix: masterMatrix, sectionsObject: sectionsObject});
        }
        else{
            // The challenger lost, leave it with only 1 tower
            sectionsObject[sectionClicked].towersValue = 1;
            this.setState({sectionsObject: sectionsObject});
        }
    }

    rollDices(sectionID) {
        const {sectionClicked, sectionsObject} = this.state,
            valueTeam1 = getRandomInt(1, sectionsObject[sectionClicked].towersValue * 10),
            valueTeam2 = getRandomInt(1, sectionsObject[sectionID].towersValue * 10)
        ;

        return valueTeam1 > valueTeam2;
    }

    render() {
        const {masterMatrix, sectionHovered, sectionClicked, sectionsObject} = this.state;
        const addedTowerValues = [];
        return (
            <div>
                {   masterMatrix.map((row, index) => {
                        // console.log(index + " " + row);
                        const hexagonContClass = classNames(
                            'hexagon-row',
                            {'even': index % 2 === 0}
                        );


                        return <div className={hexagonContClass}>{
                            row.map((sectionID, index) => {
                                const hexagonClass = classNames(
                                    "hexagon",
                                    sectionID,
                                    "team-" + getPlayerID(sectionID),
                                    "group-" + getGroupNumber(sectionID),
                                    {"hovered-section": sectionHovered === sectionID},
                                    {"clicked-section": sectionClicked === sectionID},
                                );

                                let children = "";

                                if (addedTowerValues.indexOf(sectionsObject[sectionID]) === -1) {
                                    addedTowerValues.push(sectionsObject[sectionID]);
                                    children = sectionsObject[sectionID].towersValue;
                                }

                                return <Hexagon key={sectionID + "" + index} classNam={hexagonClass} onClick={() => this.selectSection(sectionID)}
                                                onMouseOver={() => this.highlightSection(sectionID)} children={children}/>
                            })}
                        </div>
                    }
                )}
            </div>
        )
    }
}

const changeTeam = (sectionID) => {
    const newSectionID = "" + sectionID;
    const newID = newSectionID[0] === "1" ? "2" : "1";

    return newID + newSectionID.substr(1);
};

const Hexagon = ({classNam, onMouseOver, onClick, children}) => {
    return (
        <div className={classNam} onMouseOver={onMouseOver} onClick={onClick}>
            <div className="children">{children}</div>
            <div className="top"></div>
            <div className="middle"></div>
            <div className="bottom"></div>
        </div>
    )
};

const HexagonSimple = ({children}) => {
    return (
        <div>
            <div className="children">{children}</div>
            <div className="top"></div>
            <div className="middle"></div>
            <div className="bottom"></div>
        </div>
    )
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

const checkSpaceLeftMatrix = (matrix) => {

    const height = matrix.length, width = matrix[0].length;
    for (let i = 0; i < height; i++) {
        for (let q = 0; q < width; q++) {
            if (matrix[i][q] === 0) {
                return true;
            }
        }
    }

    // console.log("false");
    return false;
};

const populateMap = (width, height, playerCounterMultiplier = 1000) => {
    const sectionMaxWidth = 6,
        sectionMaxHeight = 4,
        sectionsObject = {}
    ;
    let masterMatrix = createMasterMatrix(width, height);
    // Create the player 1 and 2 counters. number they must start with number 1 and 2 to identify
    let playerOneID_counter = playerCounterMultiplier,
        playerTwoID_counter = 2 * playerCounterMultiplier;

    let counter = 1;
    // Fill the matrix until there's no space left
    while (checkSpaceLeftMatrix(masterMatrix)) {

        const randPlayerID = getRandomInt(1, 3), // get 1 or 2 randomly
            sectionHeight = getRandomInt(1, sectionMaxHeight)
        ;

        const currentPlayerID = randPlayerID === 1 ? (playerOneID_counter + counter) : (playerTwoID_counter + counter);
        let currentHeight = 0, sectionCounter = 0;

        counter++;
        sectionsObject[currentPlayerID] = {};
        sectionsObject[currentPlayerID].towersValue = getRandomInt(1, 9);
        sectionsObject[currentPlayerID].positions = {};

        //In case something goes wrong and the loop never ends
        if (counter === 1000) {
            console.log("Error: populate map overflow")
            return false;
        }

        for (let i = 0; i < height; i++) {

            const sectionWidth = getRandomInt(1, sectionMaxWidth);
            let currentWidth = 0,
                addedValue = false;

            for (let q = 0; q < width; q++) {

                if (masterMatrix[i][q] === 0) {
                    // If we've added a row already, check the item above to make sure it belongs to the same section. This makes sure the section is connected. Continue if not.
                    if (currentHeight > 0 && masterMatrix[i - 1][q] !== currentPlayerID) {
                        continue;
                    }
                    if (currentWidth > 0 && q > 0 && masterMatrix[i][q - 1] !== currentPlayerID) {
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

    console.log(masterMatrix);
    console.log(sectionsObject);
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

/**
 * Transforms a size number into an array to use map or foreach on it.
 * @param size
 * @returns {Array}
 */
const sizeToArray = (size) => {
    let array = [];
    for (let i = 0; i < size; i++) {
        array[i] = " ";
    }
    return array;
};

export default App;