interface IGame {
  action: number;
  p1: number;
  p2: number;
  tire: number;
  desk: number[];
}

const DEFAULT_GAME_DATA: IGame  = {
  action: 0,
  p1: 0,
  p2: 0,
  tire: 0,
  desk: [0,0,0,0,0,0,0,0,0]
}

export class Game implements IGame {
  public action: number;
  public p1: number;
  public p2: number;
  public tire: number;
  public desk: number[];

  constructor(game: IGame = DEFAULT_GAME_DATA) {
    this.action = game.action;
    this.p1 = game.p1;
    this.p2 = game.p2;
    this.tire = game.tire;
    this.desk = game.desk;
  }

  public static fromString(str: string): Game {
    const arrData = str.split(',');
    return new Game({
      action: +arrData[0],
      p1: +arrData[1],
      p2: +arrData[2],
      tire: +arrData[3],
      desk: arrData[4].split('').map((n: string) => +n)
    })
  }

  public toString(): string {
    return `${this.action},${this.p1},${this.p2},${this.tire},${this.desk.map((n: number) => `${n}`).join('')}`;
  }

  public setPlayer1(id: number): void {
    this.p1 = id;
  }
  public setPlayer2(id: number): void {
    this.p2 = id;
  }

  public setTire() {
    if (this.tire === 0) {
      this._setRandomTire();
    } else {
      this._toggleTire()
    }
  }

  public isReady(): boolean {
    return !!this.p1 && !!this.p2;
  }

  public isWin(): boolean {
    const combinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    const isArrayElementsTheSame = (arr: number[]): boolean =>  {
      return [...new Set(arr)].length === 1;
    };

    for (const combination of combinations) {
      const results = combination.map(index => this.desk[index]);
      if (isArrayElementsTheSame(results)) {
        return !!results[0];
      }
    }
    return false;
  }

  public generateDataFoNextTireByButtonIndex(index: number): string {
    const valueByIndex = this.desk[index];
    const nextTireDesk = this.desk.map((n: number, i: number) => i === index ? this.tire : `${n}`);
    return `${valueByIndex ? 0 : 3},${this.p1},${this.p2},${this.tire},${nextTireDesk.join('')}`;
  }

  private _setRandomTire() {
    this.tire = Math.round(Math.random()) + 1;
  }
  private _toggleTire() {
    this.tire = this.tire === 1 ? 2 : 1;
  }

}
