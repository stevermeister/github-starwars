
interface TColaider {
    x: number,
    y: number,
    color: string,
    type: string
}

interface  TGameField {
    el: Element,
    index: number
}

interface TDirection {
    x: number,
    y: number
}

export { TColaider, TGameField, TDirection };