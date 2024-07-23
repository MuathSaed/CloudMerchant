import { isValidObjectId } from "mongoose";
import * as yup from "yup";

let categories = ["Foodstuffs", "Handicrafts"];
let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!-_%*?&])[A-Za-z\d@$!-_%*?&]{8,}$/;

yup.addMethod(yup.string, "email", function validateEmail(message) {
  return this.matches(emailRegex, {
    message,
    name: "email",
    excludeEmptyString: true,
  });
});

export let newUserSchema = yup.object().shape({
  email: yup.string().email("Invalid Email!").required("All fields are required!"),
  password: yup
  .string()
  .required("All fields are required!")
  .min(8, "Password must contain at least 8 characters")
  .matches(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter and one number"),
  name: yup.string().required("All fields are required!"),
});

export let verifyTokenSchema = yup.object().shape({
  id: yup.string().test({
    name: "is-valid-id",
    message: "Invalid User ID",
    test: (value) => {
        return isValidObjectId(value);
    }
  }),
  token: yup.string().required("Token is required"),
});

export let resetPassSchema = yup.object().shape({
  id: yup.string().test({
    name: "is-valid-id",
    message: "Invalid User ID",
    test: (value) => {
        return isValidObjectId(value);
    }
  }),
  token: yup.string().required("Token is required"),
  password: yup
  .string()
  .required("All fields are required!")
  .min(8, "Password must contain at least 8 characters")
  .matches(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter and one number")
});

export let updatePassSchema = yup.object().shape({
  id: yup.string().test({
    name: "is-valid-id",
    message: "Invalid User ID",
    test: (value) => {
        return isValidObjectId(value);
    }
  }),
  password: yup
  .string()
  .required("All fields are required!")
  .min(8, "Password must contain at least 8 characters")
  .matches(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter and one number")
});

export let newProductSchema = yup.object({
  name: yup.string().required("All fields are required!"),
  description: yup.string().required("All fields are required!"),
  category: yup
    .string()
    .oneOf(categories.sort(), "Invalid category!")
    .required("All fields are required!"),
  price: yup
    .string()
    .transform((value) => {
      if (isNaN(+value)) return "";

      return +value;
    })
    .required("All fields are required!"),
  quantity: yup
    .string()
    .transform((value) => {
      if (isNaN(+value)) return "";
      return value;
    }).required("All fields are required!"),
});