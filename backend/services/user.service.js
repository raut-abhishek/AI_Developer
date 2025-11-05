import userModel from '../models/user.model.js';


export const createuser = async ({ email, password }) => {

    if(!email || !password){
        throw new console.error('Email and password are required');
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        email,
        password : hashedPassword,
    });

    return user;

}