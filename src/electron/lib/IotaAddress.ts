export class IotaAddress {
  constructor(private bechAddress, private balance) {}

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
  }
}
