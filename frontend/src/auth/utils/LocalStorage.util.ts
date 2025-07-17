import { IDENTITY_KEY } from "../constants/Authentication.constants";
import type { UserIdentityModel } from "../models/UserIdentityModel";

export const getIdentity = () : UserIdentityModel | null => {
    const user = localStorage.getItem(IDENTITY_KEY);
    return user ? JSON.parse(user) : null;
}

export const getUserAccessToken = () : string | null => {
    const user = getIdentity();
    return user?.accessToken ?? null;
}

export const setIdentity = (user : UserIdentityModel) : void => {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(user));
}

export const removeIdentity = () : void => {
    localStorage.removeItem(IDENTITY_KEY);
}

export const updateToken = (token : string) : void => {
    const user = getIdentity();
    if(user?.accessToken){
        user.accessToken = token;
        setIdentity(user);
    }
}