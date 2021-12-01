import { EventEmitter } from 'events';

export class IotaAddress {
  private events;
  constructor(private bechAddress, private balance) {
    this.events = new EventEmitter();
  }

  GetBechAddress(): string {
    return this.bechAddress;
  }

  GetBalance(): number {
    return this.balance;
  }

  GetBalanceMI() {
    return (this.balance * 0.000001).toFixed(2);
  }

  IncreaseBalance(amount: number) {
    this.balance += amount;
    this.events.emit('balance-changed', this.balance);
  }

  ListenToBalanceChange(callback) {
    this.events.on('balance-changed', () => callback(this));
  }
}
