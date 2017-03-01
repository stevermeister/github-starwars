const KEYBOARDS_CODE = {
    right: 54, // numpad 6
    left: 52, // numpad 4
    down: 53, // numpad 8
    up: 56, // numpad 8
    fire: 102 // f
};

const FIELD_SIZE = {
    leftX: 0,
    rightX: 52,
    topY: 0,
    bottomY: 6,
    columnLength: 7,
    maxLength: 370
};

const START_ENERGY_PARAMS = {
    'spaceshipBullet': {
        direction: { x: 1, y: 0 },
        duration: 60
    },
    'spaceship':{
        direction: {x: 0, y: 0},
        duration: 0
    }
};

const SHIP = {
    START_SHIP_POSITION : [
        { type: 'body', x:0, y: 2, color: '#00f' },
        { type: 'body', x:0, y: 3, color: '#00f' },
        { type: 'body', x:0, y: 4, color: '#00f' },
        { type: 'gun', x:1, y: 3, color: '#00f' }
    ],
    SPACE_SHIP_DIRECTION : {
        right: { x: 1, y:0 },
        left: { x: -1, y: 0 },
        down: { x: 0, y: 1 },
        up: { x: 0, y: -1 }
    },
    TIME_OF_DELAY_SHOTTING : 500
};

export {KEYBOARDS_CODE, FIELD_SIZE, SHIP, START_ENERGY_PARAMS };