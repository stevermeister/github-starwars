class ProcessorForState{

    private _currentState: any = {};

    constructor(options: {types: string[]}) {
        options.types.forEach(type => {
            this._currentState[type] = [];
        });
    }

    public add(params: {type: string, instance: any}): void{
        this._currentState[params.type].push(params.instance);
    }

    public get(): any {
        return this._currentState;
    }

    public update(newstate: any) {
        this._currentState = newstate;
    }

    public clear(): void {
        Object.keys(this._currentState).forEach(type => {
            this._currentState[type] = [];
        });
    }

    public clearFotStarOfDeath(): void {
        Object.keys(this._currentState).forEach(type => {
            if (type != "starOfDeath" && type != "spaceship")
                this._currentState[type] = [];
        });
    }

}

export { ProcessorForState };