import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => bcrypt.hashSync(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compareSync(password, hash);
export const generateToken = (userId: string) => jwt.sign({ userId }, 'secret_key', { expiresIn: '1h' });


const SECRET = process.env.JWT_SECRET as string;

export const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
};

export interface SignupUserData {
    firstName: string;
    lastName: string;
    profession: string;
    balance: number;
    type: "Client" | "Contractor";
    username: string;
    password: string;
}

export interface LoginUserData {
    username: string;
    password: string;
}