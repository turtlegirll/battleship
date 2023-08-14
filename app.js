const flipButton = document.querySelector('#flip')
const optionContainer = document.querySelector('.option-container')
const gamesBoardContainer = document.querySelector('#gamesboard-container')

const gamesBoardTitleContainer = document.querySelector('#gamesboard-title')
const startGameBtn = document.querySelector('#start')
flipButton.addEventListener('click', flip)
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')

let angle = 0;

function flip() {
    const optionShips = Array.from(optionContainer.children);
    angle = angle === 0 ? 90 : 0
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`);
}

const width = 10;


function createBoard(color, user) {
    const gameBoardContainerTitle = document.createElement('div');
    gameBoardContainerTitle.classList.add(`${user}-title`);
    gameBoardContainerTitle.id = `${user}-title`
    gameBoardContainerTitle.textContent = `${user} - Game Board`;

    if (user === "player") {
        gameBoardContainerTitle.textContent = `Your Boats`;

    } else {
        gameBoardContainerTitle.textContent = `Computers Boats. Attack!`;

    }

    const gameBoardContainer = document.createElement('div');
    gameBoardContainer.classList.add('game-board');
    gameBoardContainer.style.backgroundColor = color;
    gameBoardContainer.id = user;

    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        block.id = i;
        gameBoardContainer.append(block);
    }
    gamesBoardTitleContainer.append(gameBoardContainerTitle)
    gamesBoardContainer.append(gameBoardContainer);

}

createBoard('lightcoral', 'player');
createBoard('pink', 'ai');

class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }

}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart;

    if (isHorizontal) {
        validStart = startIndex <= (width * width) - ship.length ? startIndex : (width * width) - ship.length
    } else {
        //  validStart = randomStartIndex + 10 * length - 1 < width * width ? randomStartIndex : randomStartIndex - 10
        validStart = startIndex <= (width * width) - width * ship.length ? startIndex : startIndex - ship.length * width + width
    }


    shipBlocks = [];

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + 10 * i])
        }
    }

    let valid;

    // every returns true or false
    if (isHorizontal) {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id < 90 + (width * index + 1)
        )
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))


    return {
        shipBlocks, valid, notTaken
    }
}

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomStartIndex = Math.floor(Math.random() * 100)
    let randomBool = user === 'player' ? angle === 0 : Math.random() < 0.5
    let isHorizontal = randomBool
    let startIndex = startId ? startId : randomStartIndex;

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add('taken');
        })
    } else {
        if (user === 'ai') {
            addShipPiece(user, ship, startId)
        }
        if (user === 'player') {
            notDropped = true
        }
    }

}

ships.forEach(ship => {
    addShipPiece('ai', ship)
})


//drag player ships

let draggedShip;
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e) {
    notDropped = false;
    draggedShip = e.target;
}

function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startId)
    if (!notDropped) {
        draggedShip.remove()
    }
}


//highlight
function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div');
    let isHorizontal = angle === 0
    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)
    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout(() => shipBlock.classList.remove('hover'), 900)
        })
    }
}

let gameOver = false;
let playerTurn;

startGameBtn.addEventListener('click', startGame)

function startGame() {
    if (playerTurn === undefined) {
        if (optionContainer.children.length !== 0) {
            infoDisplay.textContent = "Please place all your ships!"
        } else {
            const allBoardBlocks = document.querySelectorAll('#ai div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
            playerTurn = true
            turnDisplay.textContent = "Your Go!"
            infoDisplay.textContent = "The Game has begun"
        }
    }
}

function displayWin() {
    if (playerSunkShips.length === 5) {
        infoDisplay.textContent = "Game Over! You sunk all the computers ships. You won!"

    }
    if (aiSunkShips.length === 5) {
        infoDisplay.textContent = "Game Over! Computer sunk all your ships. You lost!"
    }

}

let playerHits = []
let aiHits = []
const playerSunkShips = []
const aiSunkShips = []
let aiHitsIndex = []
let aiMoveIndex = []
let aiSunkenShipIndices = []

function handleClick(e) {
    if (!gameOver) {
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = "You hit a part of a ship!"
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes);
            checkScore('player', playerHits, playerSunkShips)
        } else {
            e.target.classList.add('empty')
            infoDisplay.textContent = "You missed"
        }
        playerTurn = false;
        const allBoardBlocks = document.querySelectorAll('#ai div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 1000)
    } else {
        displayWin()
    }
}

//TODO: after computer sunk ship deleted the adjacent ind and start from random index
let adjacentIndices = []
let availableAdjacentIndices = []
let newAdjacentIndices = []
let currentlyStruckShip = []

function computerGo() {
    console.log("in ComputerGo()")

    console.log('aiHits', aiHits)
    console.log('aiSunkShips', aiSunkShips)
    console.log('aiHitIndex', aiHitsIndex)
    console.log('aiMoveIndex', aiMoveIndex)

    if (!gameOver) {
        turnDisplay.textContent = "Computer's turn";
        infoDisplay.textContent = "Computer is thinking...";
    }

    setTimeout(() => {

        let randomGo = Math.floor(Math.random() * width * width);

        const allBoardBlocks = document.querySelectorAll('#player div')

        // Check if there are any ships that were hit but not sunk yet
        if (aiHitsIndex.length > 0 && aiSunkShips.indexOf(aiHitsIndex[0]) === -1) {
            console.log("There are hit ships that arent sunken")
            const lastMoveIndex = aiMoveIndex[aiMoveIndex.length - 1]; //Last move
            const lastHitIndex = aiHitsIndex[aiHitsIndex.length - 1]; // Last hit index

            console.log(availableAdjacentIndices, "availableAdjacentIndices")
            if (availableAdjacentIndices.length === 0) {
                console.log(availableAdjacentIndices, "availableAdjacentIndices was empty")
                adjacentIndices = getAdjacentIndices(lastHitIndex, aiMoveIndex);
                availableAdjacentIndices = availableAdjacentIndices.concat(adjacentIndices)

            }
            console.log("Before filtering:", availableAdjacentIndices);
            availableAdjacentIndices = availableAdjacentIndices.filter(index =>
                !aiHitsIndex.includes(index) &&
                !aiMoveIndex.includes(index) &&
                index >= 0 &&
                index < width * width
            );
            console.log("After filtering:", availableAdjacentIndices);


            console.log("Last move was a hit")
            if (availableAdjacentIndices.length > 0) {
                console.log("!hi")
                console.log(availableAdjacentIndices)

                let randomGoTemp = availableAdjacentIndices[Math.floor(Math.random() * availableAdjacentIndices.length)];
                console.log("randomGoTemp", randomGoTemp)

                newAdjacentIndices = getAdjacentIndices(randomGoTemp, aiMoveIndex)
                console.log(newAdjacentIndices, 'newAdjacentIndices')
                if (allBoardBlocks[randomGoTemp].classList.contains('taken') && !allBoardBlocks[randomGoTemp].classList.contains('boom')) {
                    console.log("A ship has been hit")

                    // Filter out indices that are already hit or moved to
                    newAdjacentIndices = newAdjacentIndices.filter(index =>
                        !aiHitsIndex.includes(index) &&
                        !aiMoveIndex.includes(index) &&
                        index >= 0 &&
                        index < width * width
                    );

                    console.log(newAdjacentIndices, 'newAdjacentIndices after filter out')


                    if (newAdjacentIndices.length > 0) {
                        availableAdjacentIndices = availableAdjacentIndices.concat(newAdjacentIndices)
                        console.log(availableAdjacentIndices, 'availableAdjacentIndices after concat')

                        randomGo = randomGoTemp;
                        console.log(randomGo, "randomGo here")
                    } else {
                        console.log('No available adjacent indices')
                        console.log(availableAdjacentIndices, 'availableAdjacentIndices if there are no new adjacentIndices')

                        randomGo = availableAdjacentIndices[Math.floor(Math.random() * availableAdjacentIndices.length)];
                        console.log(randomGo, "randomGo here when none")

                    }
                } else {
                    console.log("The ship with this ne index wouldnt be hit")
                    console.log(availableAdjacentIndices, 'availableAdjacentIndices if the ship wouldnt be hit')
                    randomGo = randomGoTemp;
                    console.log(randomGo, 'randomGo if the ship wouldnt be hit')

                }
            } else {
                // If no available adjacent indices, revert to random move
                if (aiHitsIndex.length === 1 && aiMoveIndex.length === 1) {
                    adjacentIndices = getAdjacentIndices(lastHitIndex, aiMoveIndex);
                    randomGo = adjacentIndices[Math.floor(Math.random() * adjacentIndices.length)];
                    console.log(randomGo, "randomGo  // If ship struck at first move")

                } else {
                    console.log(randomGo, "randomGo  // If no available adjacent indices, revert to random move")

                    randomGo = Math.floor(Math.random() * width * width);
                }

            }
        }

//TODO: addd some consol logs here currently doesnt work

        /*        const sunkenShipIndexes = checkSunkShips()
                if (sunkenShipIndexes.length !== 0) {
                    console.log(sunkenShipIndexes, "there are sunkenShipIndexes")
                    let adjacentIndicesToSunkenShip
                    for (const sunkIndex of sunkenShipIndexes) {
                        adjacentIndicesToSunkenShip = getAdjacentIndices(sunkIndex, aiMoveIndex)
                    }

                    availableAdjacentIndices = availableAdjacentIndices.filter(index => {
                        !adjacentIndicesToSunkenShip.includes(index) &&

                        console.log(availableAdjacentIndices, "availableAdjacentIndices without adjacent indices to sunken ship")
                    });
                    randomGo = availableAdjacentIndices[Math.floor(Math.random() * availableAdjacentIndices.length)];
                    console.log(randomGo, "randomGo after removing")
                }*/

        console.log("Next found index: ", randomGo);

        if (allBoardBlocks[randomGo].classList.contains('taken') && allBoardBlocks[randomGo].classList.contains('boom')) {
            computerGo()
        } else if (allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')) {
            console.warn("i am here")
            allBoardBlocks[randomGo].classList.add('boom')
            aiHitsIndex.push(randomGo)
            aiMoveIndex.push(randomGo)
            infoDisplay.textContent = "Computer hit your ship!"
            let classes = Array.from(allBoardBlocks[randomGo].classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            aiHits.push(...classes)
            console.warn(currentlyStruckShip, "currentlyStruckShip")
            checkScore('ai', aiHits, aiSunkShips)

            let shipName = classes[0]
            let shipLength = 0
            console.log(shipName, "shipName before if")
            if (shipName === "destroyer") {
                shipLength = 2
            }
            if (shipName === "submarine") {
                shipLength = 3
            }
            if (shipName === "cruiser") {
                shipLength = 3
            }
            if (shipName === "battleship") {
                shipLength = 4
            }
            if (shipName === "carrier") {
                shipLength = 5
            }
            if (aiHits.filter(storedShipName => storedShipName === shipName).length === shipLength) {

                const shipBlocks = Array.from(allBoardBlocks).filter(block => block.classList.contains(shipName));

                // Mark ship as sunk and store its indices
                shipBlocks.forEach(block => block.classList.add('sunk'));
                const shipIndices = shipBlocks.map(block => parseInt(block.id));
                for (const index of shipIndices){
                   let adjacentSunkenIndices = getAdjacentIndices(index,aiMoveIndex)
                    availableAdjacentIndices = availableAdjacentIndices.filter(index =>
                        !aiSunkenShipIndices.includes(adjacentSunkenIndices)
                    );
                }

                aiSunkenShipIndices.push(...shipIndices);

                shipLength = 0
                shipName = ""
                console.log(availableAdjacentIndices,"availableAdjacentIndices after filteringout sunken adjacentz")

            }
            console.log(shipName, "shipName after if")


        } else {
            infoDisplay.textContent = "Nothing hit this time"
            allBoardBlocks[randomGo].classList.add('empty')
            aiMoveIndex.push(randomGo)

        }


    }, 200);
    setTimeout(() => {
        playerTurn = true;
        turnDisplay.textContent = "Players move"
        infoDisplay.textContent = "Please make your move"
        const allBoardBlocks = document.querySelectorAll('#ai div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }, 500)
}



// Function to get adjacent indices for a given index, filters out the hits made by computer
function getAdjacentIndices(index, hits) {
    console.log("in getAdjacentIndices")
    console.log("index", index)
    const adjacentIndices = [];

    let result
    if ((result = index - width) >= 0 && !hits.includes(result)) {
        adjacentIndices.push(result)
    }
    if ((result = index + width) < width * width && !hits.includes(result)) {
        adjacentIndices.push(result)
    }

    if (index % width !== 0 && !hits.includes(index - 1)) {
        adjacentIndices.push(index - 1);
    }
    if ((index + 1) % width !== 0 && !hits.includes(index + 1)) {
        adjacentIndices.push(index + 1);
    }

    console.log("found adjacent indices: ", adjacentIndices)

    return adjacentIndices;
}


function checkScore(user, hits, sunkenShips) {
    function checkShip(shipName, shipLength) {
        if (hits.filter(storedShipName => storedShipName === shipName).length === shipLength) {

            if (user === "player") {
                infoDisplay.textContent = `You have sunk the computer's ship ${shipName}!`

                playerHits = hits.filter(storedShipName => storedShipName !== shipName)
            }
            if (user === "ai") {
                infoDisplay.textContent = `The computer have sunk the player's ship ${shipName}!`

                aiHits = hits.filter(storedShipName => storedShipName !== shipName)
            }
            sunkenShips.push(shipName)
        }
    }


    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)


    if (playerSunkShips.length === 5) {
        infoDisplay.textContent = "You sunk all the computers ships. You won!"
        gameOver = true
        displayWin()

    }
    if (aiSunkShips.length === 5) {
        infoDisplay.textContent = "Computer sunk all your ships. You lost!"
        gameOver = true
        displayWin()
    }


}

//TODO: if the ship has been sunk dont go all around
// if the sunken indices are following a horizontal or vertical pattern, follow it?
