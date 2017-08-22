import React, {Component} from 'react';
import classNames from 'classnames';
import {_} from 'lodash';
import './App.css';

class App extends Component {
    render() {
        console.log(populateMap(10, 10));
        return (
            <div className="App">
                <div className="hexagon-section">
                    <HexagonRow team={1} amountHexagons={3}/>
                    <HexagonRow team={2} amountHexagons={4}/>
                    <HexagonRow amountHexagons={3}/>
                </div>
                <div className="hexagon-section">
                    <HexagonRow team={1} amountHexagons={3}/>
                    <HexagonRow team={2} amountHexagons={4}/>
                    <HexagonRow amountHexagons={3}/>
                </div>
                <div className="hexagon-section">
                    <HexagonRow team={1} amountHexagons={3}/>
                    <HexagonRow team={2} amountHexagons={4}/>
                    <HexagonRow amountHexagons={3}/>
                </div>
            </div>
        );
    }
}


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

const Hexagon = ({team}) =>
    <div className="hexagon">
    </div>;


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

const checkSpaceLeftMatrix = (matrix) => {

    const height = matrix.length, width = matrix[0].length;
    for (let i = 0; i < height; i++) {
        for (let q = 0; q < width; q++) {
            if (matrix[i][q] === 0) {
                console.log("true")
                return true;
            }
        }
    }

    console.log("false");
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


    // Fill the matrix until there's no space left
    while (checkSpaceLeftMatrix(masterMatrix)) {
        const randPlayerID = getRandomInt(1, 3), // get 1 or 2 randomly
            sectionHeight = getRandomInt(1, sectionMaxHeight);
        const currentPlaterID = randPlayerID === 1 ? ++playerOneID_counter : ++playerTwoID_counter;
        let currentHeight = 0;

        for (let i = 0; i < height; i++) {
            const sectionWidth = getRandomInt(1, sectionMaxWidth);
            let currentWidth = 0;
            for (let q = 0; q < width; q++) {

                if (masterMatrix[i][q] === 0) {
                    // If we've added a row already, check the item above to make sure it belongs to the same section. This makes sure the section is connected
                    if (currentHeight > 0 && comparePlayersInMatrix(currentPlaterID, masterMatrix[i - 1][q], playerCounterMultiplier)) {
                        continue;
                    }

                    masterMatrix[i][q] = currentPlaterID;
                    currentWidth++
                }

                if (currentWidth === sectionWidth) {
                    break;
                }
            }
            currentHeight++;
            if (currentHeight === sectionHeight) {
                break;
            }
        }
    }

    return masterMatrix;
};

const comparePlayersInMatrix = (currentPlayer, toCompareWithPlayer, playerCounterMultiplier) =>
~~(currentPlayer / playerCounterMultiplier) === ~~(toCompareWithPlayer / playerCounterMultiplier);

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