export interface LoginRequestModel {
  username: string;
  password: string;
}

export interface LoginResponseModel {
    username : string,
    token : string
};