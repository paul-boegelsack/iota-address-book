import { EventEmitter } from 'events'

/**
 * Defines signature of balance change callback
 */
export interface BalanceChangeCallback {
    (): void
}

/**
 * Class which encapsulates data of an iota address.
 */
export class IotaAddress {
    private events

    /**
     * @param bechAddress bech32 address
     * @param balance     balance in iota
     */
    constructor(private bechAddress: string, private balance: number) {
        this.events = new EventEmitter()
    }

    /**
     * @returns Bech32 address
     */
    GetBechAddress(): string {
        return this.bechAddress
    }

    /**
     * @returns balance in iota
     */
    GetBalance(): number {
        return this.balance
    }

    /**
     * @returns balance in miota
     */
    GetBalanceMI(): string {
        return (this.balance * 0.000001).toFixed(2)
    }

    /**
     * Increases the address balance and fires an balance-change event
     * @param amount increased balance amount
     */
    IncreaseBalance(amount: number): void {
        this.balance += amount
        this.events.emit('balance-changed', this.balance)
    }

    /**
     * Listener for detecting balance changes
     * @param callback called if address balance changed
     */
    ListenToBalanceChange(callback: BalanceChangeCallback): void {
        this.events.on('balance-changed', () => callback())
    }
}
