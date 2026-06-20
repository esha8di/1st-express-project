export interface IUSER {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}
