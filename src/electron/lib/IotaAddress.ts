import { EventEmitter } from 'events'

export interface BalanceChangeCallback {
    (): void
}

export class IotaAddress {
    private events
    constructor(private bechAddress: string, private balance: number) {
        this.events = new EventEmitter()
    }

    GetBechAddress(): string {
        return this.bechAddress
    }

    GetBalance(): number {
        return this.balance
    }

    GetBalanceMI(): string {
        return (this.balance * 0.000001).toFixed(2)
    }

    IncreaseBalance(amount: number): void {
        this.balance += amount
        this.events.emit('balance-changed', this.balance)
    }

    ListenToBalanceChange(callback: BalanceChangeCallback): void {
        this.events.on('balance-changed', () => callback())
    }
}
