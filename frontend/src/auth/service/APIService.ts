import { APIService } from '../../common/services/APIService';
import type { LoginRequestModel, LoginResponseModel } from './../models/LoginModel';

const env = import.meta.env;

export const loginService = async (loginModel: LoginRequestModel): Promise<LoginResponseModel> => {
    const response = await APIService.post<LoginResponseModel, LoginRequestModel>(env.VITE_LOGIN_URL, loginModel);  
    return response.data;
};
