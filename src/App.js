import React, {Component} from 'react';
import classNames from 'classnames';
import {_} from 'lodash';
import './App.css';

class App extends Component {

    constructor(props){
        super(props);

        this.state = {
            sectionHovered: 0,
            masterMatrix: []
    };
        this.selectGroup = this.selectGroup.bind(this);
    }

    componentDidMount(){
        this.setState({ masterMatrix: populateMap(10, 10)});
    }


    selectGroup(groupID){
        console.log("hovering over: " + groupID)
        this.setState({sectionHovered: groupID});
    }

    render() {
        const {masterMatrix, sectionHovered} = this.state
        return (
            <div>
                {   masterMatrix.map((row, index) => {
                        // console.log(index + " " + row);
                    const hexagonContClass = classNames(
                        'hexagon-row',
                        {'even': index % 2 === 0}
                    );

                        return <div className={hexagonContClass}>{
                            row.map((groupID, index) => {
                                const hexagonClass = classNames(
                                    "hexagon",
                                    groupID,
                                    "team-" + getPlayerID(groupID),
                                    "group-" + getGroupNumber(groupID),
                                    {"hovered-true": sectionHovered === groupID}
                                );
                                return <Hexagon key={groupID + "" + index} classNam={hexagonClass} onMouseOver={() => this.selectGroup(groupID)}/>
                            })}
                        </div>
                    }
                )}
            </div>
        )
    }
}


const Hexagon = ({classNam, onMouseOver}) => {
    return (
        <div className={classNam} onMouseOver={onMouseOver}>
            <div className="top"></div>
            <div className="middle"></div>
            <div className="bottom"></div>
        </div>
    )
};


class HexagonRow extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {amountHexagons, team} = this.props;

        const hexagonClass = classNames(
            'hexagon-row',
            'team-' + team,
            {'even': amountHexagons % 2 === 0}
        );
        const arrayAmountHexagons = sizeToArray(amountHexagons);

        return (
            <div className={hexagonClass}>
                {arrayAmountHexagons.map(function () {
                    return <Hexagon/>
                })}
            </div>
        )
    }
}

const buildHexagonLayout = (masterMatrix) => {

    const height = masterMatrix.length, width = masterMatrix[0].length;

    for (let i = 0; i < height; i++) {
        for (let q = 0; q < width; q++) {
            if (masterMatrix[i][q] === 0) {
                continue;
            }
        }
    }

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
        sectionMaxHeight = 4
    ;

    let masterMatrix = createMasterMatrix(width, height);
    // Create the player 1 and 2 counters. number they must start with number 1 and 2 to identify
    let playerOneID_counter = playerCounterMultiplier,
        playerTwoID_counter = 2 * playerCounterMultiplier;

    let counter = 0;
    // Fill the matrix until there's no space left
    while (checkSpaceLeftMatrix(masterMatrix)) {

        const randPlayerID = getRandomInt(1, 3), // get 1 or 2 randomly
            sectionHeight = getRandomInt(1, sectionMaxHeight);

        const currentPlaterID = randPlayerID === 1 ? ++playerOneID_counter : ++playerTwoID_counter;
        let currentHeight = 0;

        counter++;
        if (counter === 100) {
            // console.log(masterMatrix);
            return false;
        }

        for (let i = 0; i < height; i++) {

            const sectionWidth = getRandomInt(1, sectionMaxWidth);
            let currentWidth = 0,
                addedValue = false;

            for (let q = 0; q < width; q++) {

                if (masterMatrix[i][q] === 0) {
                    // If we've added a row already, check the item above to make sure it belongs to the same section. This makes sure the section is connected. Continue if not.
                    if (currentHeight > 0 && masterMatrix[i - 1][q] !== currentPlaterID) {
                        continue;
                    }
                    if(currentWidth > 0 && q > 0 && masterMatrix[i][q - 1] !== currentPlaterID){
                        continue;
                    }

                    masterMatrix[i][q] = currentPlaterID;
                    currentWidth++;
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

    return masterMatrix;
};

// Divides the player id for that place (e.j 2005) to the counterMultiplier (1000). Get the integer that is the player ID with ~~ (2)
const comparePlayersInMatrix = (currentPlayer, toCompareWithPlayer, playerCounterMultiplier) =>
~~(currentPlayer / playerCounterMultiplier) === ~~(toCompareWithPlayer / playerCounterMultiplier);

const getPlayerID = (currentPlayerID) => {
    let string = "" + currentPlayerID;
    return string[0];
}

const getGroupNumber = (currentPlayerID) => {
    let string = "" + currentPlayerID;
    // In case the group number is above 9
    if( string[string.length - 2] !== "0")
        return string[string.length - 2] + string[string.length - 1];
    return string[string.length - 1];
}

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