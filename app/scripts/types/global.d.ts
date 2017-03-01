
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

interface TSound {
    name: string,
    url: string,
    loop: boolean,
    volume: number
}

export { TColaider, TGameField, TDirection, TSound };