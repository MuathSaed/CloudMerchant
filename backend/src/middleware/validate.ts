import { RequestHandler } from "express";
import * as yup from "yup";

let validate = (schema: yup.Schema): RequestHandler => {
    return async (req, res, next) => {
        try {
            await schema.validate({...req.body}, { strict: true, abortEarly: true });
            next();
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                return res.status(422).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }
};

export default validate;
