const flipButton = document.querySelector('#flip')
const optionContainer = document.querySelector('.option-container')
const gamesBoardContainer = document.querySelector('#gamesboard-container')
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

    console.log('valid' + validStart)

    shipBlocks = [];

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + 10 * i])
        }
    }

    let valid;
    console.log(shipBlocks)
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

    console.log(valid + ' val')

    return {
        shipBlocks, valid, notTaken
    }
}

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomStartIndex = Math.floor(Math.random() * 100)
    //let randomStartIndex = 80
    let randomBool = user === 'player' ? angle === 0 : Math.random() < 0.5
    let isHorizontal = randomBool
    let startIndex = startId ? startId : randomStartIndex;

    console.log(randomStartIndex);
    console.log(isHorizontal);

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

    // console.log(shipBlocks)
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
    console.log(e.target)
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
    if(playerTurn ===undefined){
        if (optionContainer.children.length !== 0) {
            infoDisplay.textContent = "Please place all your ships!"
        } else {
            const allBoardBlocks = document.querySelectorAll('#ai div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }
        playerTurn = true
        turnDisplay.textContent = "Your Go!"
        infoDisplay.textContent = "The Game has begun"
        console.log('start')
    }

}

let playerHits = []
let aiHits = []
const playerSunkShips = []
const aiSunkShips = []

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
            console.log(playerHits)
        } else {
            e.target.classList.add('empty')
            infoDisplay.textContent = "You missed"
        }
        playerTurn = false;
        const allBoardBlocks = document.querySelectorAll('#ai div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 1000)
    }
}

function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = "Computers turn"
        infoDisplay.textContent = "Computer is thinking..."
    }
    setTimeout(() => {
        let randomGo = Math.floor(Math.random() * width * width)
        const allBoardBlocks = document.querySelectorAll('#player div')
        if (allBoardBlocks[randomGo].classList.contains('taken') && allBoardBlocks[randomGo].classList.contains('boom')) {
            computerGo()
            return
        } else if (allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')) {
            allBoardBlocks[randomGo].classList.add('boom')
            infoDisplay.textContent = "Computer hit your ship!"
            let classes = Array.from(allBoardBlocks[randomGo].classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            aiHits.push(...classes)
            checkScore('ai', aiHits, aiSunkShips)
            return;
        } else {
            infoDisplay.textContent = "Nothing hit this time"
            allBoardBlocks[randomGo].classList.add('empty')
        }


    }, 2000)
    setTimeout(() => {
        playerTurn = true;
        turnDisplay.textContent = "Players move"
        infoDisplay.textContent = "Please make your move"
        const allBoardBlocks = document.querySelectorAll('#ai div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }, 3000)

}

function checkScore(user, hits, sunkenShips) {
    function checkShip(shipName, shipLength) {
        if (hits.filter(storedShipName => storedShipName === shipName).length === shipLength) {

            if (user === "player") {
                infoDisplay.textContent = `You have sunk the compuer's ship ${shipName}!`

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

    console.log('playerHits', playerHits)
    console.log('playerSunkships', playerSunkShips)

    if (playerSunkShips.length === 5) {
        infoDisplay.textContent = "You sunk all the computers ships. You won!"
        gameOver = true

    }
    if (aiSunkShips.length === 5) {
        infoDisplay.textContent = "Computer sunk all your ships. You lost!"
        gameOver = true
    }
}

