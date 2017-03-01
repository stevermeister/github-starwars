import { EventEmitter} from "./lib";
import { TSound } from "./types/global"

class Music {
    private readonly  PATH_FOR_STATIC = 'http://forjob.esy.es/';

    constructor(arrayOfSounds:TSound[]) {
        this._init(arrayOfSounds);
        EventEmitter.on('play sound', (data:{type:string}) => this.play(data));
        EventEmitter.on('stop game', (data:{type:string}) => {
            this.stop({type:"main"});
            (data.type === 'lose') ? this.play({type: "gameover"}): this.play({type: "win"});
            this.stop({type: "blaster"});
        });
    }

    private _init(arrayOfSounds:TSound[]):void {
        arrayOfSounds.forEach((sound) => {
            this[sound.name] = new Audio(this.PATH_FOR_STATIC + sound.url);
		    this[sound.name].loop = sound.loop;
		    this[sound.name].volume = sound.volume;
        });
    }

    public play(objectOfSound:{type:string}):void {
        if (!this[objectOfSound.type].paused) {
            this[objectOfSound.type].pause();
            this[objectOfSound.type].currentTime = 0.0;
        }
        if (this[objectOfSound.type].paused) this[objectOfSound.type].play();
    }

    public stop(objectOfSound:{type:string}):void {
        this[objectOfSound.type].pause();
	    this[objectOfSound.type].currentTime = 0.0;
    }

    public muteAll(arrayOfSounds:TSound[]):void {
        arrayOfSounds.forEach((sound) => {
            this[sound.name].pause();
            this[sound.name].currentTime = 0.0;
        });
    }
}

export { Music };