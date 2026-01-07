export interface IToken {
  id: string;
  role: string;
  isActive?: boolean;
  iat?: any;
  exp?: any;
}
