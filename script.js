const canvas = document.querySelector('#game');
// hay que asignarle un contexto al canvas
const game = canvas.getContext('2d');

const up = document.querySelector('#up');
const left = document.querySelector('#left');
const right = document.querySelector('#right');
const down = document.querySelector('#down');

const spanLives = document.querySelector('#lives')
const spanTime = document.querySelector('#time')

const spanRecord = document.querySelector('#record')
const pResult = document.querySelector('#result')
const btnReiniciar= document.querySelector('#reiniciar')

let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

let canvasSize;
let elementSize;

// posicion del jugador
const playerPosition = {
    x: undefined,
    y: undefined,
}
// posicion de la meta
const giftPosition = {
    x: undefined,
    y: undefined,
}
// posicion de todos los obstaculos
let enemisPosition = []


// cuando cargue el la pagina se ejecutara la funcion que se especifique
window.addEventListener('load', setCanvasSize)

// agregar elemento cada vez que la ventana se redimencione
window.addEventListener('resize', setCanvasSize)

// reiniciar el juego
btnReiniciar.addEventListener('click',function(){location.reload()})

function setCanvasSize() {
    // para generar medidas responsivas se puede hacer uso de las siguientes funciones
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.8
    } else {
        canvasSize = window.innerHeight * 0.8
    }

    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)
    // definir el tamaño de los elementos
    elementSize = canvasSize / 10;

    playerPosition.x = undefined;
    playerPosition.y = undefined;

    startGame()
}


function startGame() {
    // cada que se renderice el mapa hay que limpiar de nuevo las posiciones de los obstaculos ya que se iran acumulando
    enemisPosition = []

    // definir tamaño y posicionamiento de los elementos
    game.font = elementSize + 'px Verdana'
    game.textAlign = 'end'

    // al agregar .trim se borran los espacios vacios de un string
    const map = maps[level]

    // si no hay un mapa
    if (!map) {
        gameWin();
        return
    }
    // si no hay un tiempo anterior
    if (!timeStart) {
        timeStart = Date.now()
        timeInterval = setInterval(showTime, 100);
        shoeRecord();
    }

    //con split se puede dividir strings en elementos dentro de un array
    const mapRows = map.trim().split('\n')
    // console.log(mapRows);
    // generar array bidimencional
    const mapRowCols = mapRows.map(r => r.trim().split(''))
    // console.log(mapRowCols);

    showLives();

    // renderizar todo el mapa teniendo en cuenta los mapas
    game.clearRect(0, 0, canvasSize, canvasSize);
    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            let posX = (elementSize * (colI + 1)) + (elementSize * 0.2);
            let posY = (elementSize * (rowI + 1)) - (elementSize * 0.15);


            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                }
            } else if (col == 'I') {
                giftPosition.x = posX;
                giftPosition.y = posY;
            } else if (col == 'X') {
                enemisPosition.push({ x: posX, y: posY })
            }

            game.fillText(emojis[col], posX, posY)
        });
    });

    movePlayer();
    // con j se crea cada elemento por columna mientras que con i se crea por fila
    // for (let i = 1; i <= 10; i++) {
    //     for (let j = 1; j <= 10; j++) {
    //         // para remplazar las letras por los emojis se usan las posiciones del renderizado
    //         let emoji=(mapRowCols[i-1][j-1]);
    //         game.fillText(emojis[emoji], (elementSize * j) + (elementSize * 0.2), (elementSize * i) - (elementSize * 0.15))
    //     }
    // }
    // // crear figuras
    // game.fillRect(0,20,100,100);
    // // boorar en ciertas coordenadas
    // game.clearRect(10,30,80,80)
    // // ingresar texto
    // game.font='25px verdana'
    // game.fillStyle='blue'
    // game.textAlign='start'
    // game.fillText('Hello',15,15)
}
// cada que el jugador ejecute un movimiento hay que tener en cuenta varias situaciones
function movePlayer() {
    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)
    // almacenar las posiciones del jugador y la meta, redondeando sus valores para que no ocurran problemas de coincidencia en las cordenadas
    let playerX = Math.floor(playerPosition.x)
    let playerY = Math.floor(playerPosition.y)
    let giftX = Math.floor(giftPosition.x)
    let giftY = Math.floor(giftPosition.y)

    // si la posicion del jugador y la meta coinciden entonces se sube de nivel
    if (playerX == giftX && playerY == giftY) {
        levelUp();
    }

    // en caso de colicionar con una bomba
    levelFail(playerX, playerY);
    
}


function levelUp() {
    console.log('subiste al nivel ' + (level + 2));
    level++;
    startGame();
}
// cuando se pasan todos los niveles
function gameWin() {
    console.log('Terminaste');
    clearInterval(timeInterval)

    const recordTime = localStorage.getItem('record_time')
    const playerTime = (Date.now() - timeStart) / 1000;

    if (recordTime) {
        if (recordTime > playerTime) {
            localStorage.setItem('record_time', playerTime)
            pResult.innerText = 'Record superado 😀'
        } else {
            pResult.innerText = 'Record no superado 😕'
        }
    } else {
        localStorage.setItem('record_time', playerTime)
        pResult.innerText = 'Intenta superar tu record'
    }
    console.log({ recordTime, playerTime });
}

function pausar(milliseconds) {
    const start = new Date().getTime();
    while (true) {
      const current = new Date().getTime();
      if (current - start >= milliseconds) {
        break;
      }
    }
  }

// cuando se detectan coliciones con algun obstaculo
function levelFail(playerX, playerY) {
    enemisPosition.forEach(bomba => {
        if (lives > 0) {

            let bomX = Math.floor(bomba.x)
            let bomY = Math.floor(bomba.y)
            if (bomX == playerX && bomY == playerY) {
                console.log('colicion contra bomba');
                lives--;
                pausar(3000)
                playerPosition.x = undefined;
                playerPosition.y = undefined;
                startGame()

            }
        } else {
            console.log('PERDISTE');
            level = 0;
            lives = 3;
            timeStart = undefined;
            playerPosition.x = undefined;
            playerPosition.y = undefined;
            startGame();
        }
    })
}
// para detectar los eventos del teclado
window.addEventListener('keydown', moveByKeys)
up.addEventListener('click', moveUp);
left.addEventListener('click', moveLeft);
right.addEventListener('click', moveRight);
down.addEventListener('click', moveDown);

function showLives() {
    spanLives.innerText = ''
    for (let i = 0; i < lives; i++) {
        spanLives.innerText += emojis['HEART']
    }
}
function showTime() {
    spanTime.innerText = (Date.now() - timeStart) / 1000;
}
function shoeRecord() {
    spanRecord.innerText = localStorage.getItem('record_time')
}

// funciones de movimiento
function moveUp() {
    console.log('arriba');
    if (playerPosition.y - elementSize <= 0) {
        console.log('stop');
    } else {
        playerPosition.y -= (elementSize);
        startGame();
    }

}
function moveLeft() {
    console.log('izquierda');
    if (playerPosition.x - elementSize <= elementSize) {
        console.log('stop');
    } else {

        playerPosition.x -= (elementSize);
        startGame();
    }
}
function moveRight() {
    console.log('derecha');
    if (playerPosition.x + elementSize >= canvasSize + elementSize) {
        console.log('stop' + playerPosition.x);
    } else {
        playerPosition.x += (elementSize);
        startGame();
    }
}
function moveDown() {
    console.log('abajo');
    if (playerPosition.y + elementSize >= canvasSize) {
        console.log('stop');
    } else {

        playerPosition.y += (elementSize);
        startGame();
    }
}
// eventos en cada tecla 
function moveByKeys(e) {
    switch (e.key) {
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowDown':
            moveDown();

            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        default:
            break;
    }
}








