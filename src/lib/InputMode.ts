import type { Address } from './interfaces/address'

export interface ModeFunction {
    (): Promise<Address[]>
}

export class InputMode {
    constructor(
        private name: string,
        private placeholder: string,
        private active: boolean,
        public ModeFunction: ModeFunction
    ) {}

    GetName(): string {
        return this.name
    }

    GetPlaceholder(): string {
        return this.placeholder
    }

    GetActive(): boolean {
        return this.active
    }

    SetActive(active: boolean): void {
        this.active = active
    }
}
