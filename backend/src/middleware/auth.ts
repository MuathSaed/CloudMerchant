import { RequestHandler } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import UserModel from "src/models/user";
import ResetTokenModel from "src/models/resetToken";

let JWT_SECRET = process.env.JWT_SECRET!;

interface UserProfile {
    id: string | unknown;
    name: string;
    email: string;
    verified: boolean;
    avatar?: string;
    role?: string;
}

declare global {
    namespace Express {
        interface Request {
            user: UserProfile;
        }
    }
}

export let isAuth: RequestHandler = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        if (!authHeader) return res.status(403).json({ error: "Unauthorized Request!" });

        let token = authHeader.split(" ")[1];
        let payload = jwt.verify(token, JWT_SECRET) as { id: string };

        let user = await UserModel.findById(payload.id);
        if (!user) return res.status(403).json({ error: "Unauthorized Request!" });

        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            avatar: user.avatar?.url
        };

        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({ error: "Unauthorized Request, Token Expired!" });
        }

        if (error instanceof JsonWebTokenError) {
            return res.status(403).json({ error: "Unauthorized Request!" });
        }

        next(error);
    }
};

export let isValidPassResetToken: RequestHandler = async (req, res, next) => {
    let { id, token } = req.body;

    let resetPassToken = await ResetTokenModel.findOne({ owner: id });
    if (!resetPassToken) return res.status(403).json({ error: "Unauthorized Request, Invalid Token!" });

    let isMatched = await resetPassToken.compareToken(token);
    if (!isMatched) return res.status(403).json({ error: "Unauthorized Request, Invalid Token!" });

    next();
}

export let isAdmin: RequestHandler = async (req, res, next) => {

    let user;

    try {
        let authHeader = req.headers.authorization;
        if (!authHeader) return res.status(403).json({ error: "Unauthorized Request!" });

        let token = authHeader.split(" ")[1];
        let payload = jwt.verify(token, JWT_SECRET) as { id: string };

        user = await UserModel.findById(payload.id);
        if (!user) return res.status(403).json({ error: "Unauthorized Request!" });

        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            avatar: user.avatar?.url
        };

    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({ error: "Unauthorized Request, Token Expired!" });
        }

        if (error instanceof JsonWebTokenError) {
            return res.status(403).json({ error: "Unauthorized Request!" });
        }

        next(error);
    }

    if (user && user.role !== 'Admin') {
        return res.status(403).json({ error: "Unauthorized Request, Admin Access Required!" });
    }
    next();
};