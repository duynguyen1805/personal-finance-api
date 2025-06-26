export interface Chain {
  id: string;
  name: string;
  tokenStandard: StandardToken;
}

export interface StandardToken {
  address: string;
  name: string;
}
