import * as yup from "yup";

type ValidationResult<T> = { error?: string; values?: T };

export let yupValidate = async <T extends object>(
  schema: yup.Schema,
  value: T
): Promise<ValidationResult<T>> => {
  try {
    let data = await schema.validate(value);
    return { values: data };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { error: error.message };
    } else {
      return { error: (error as any).message };
    }
  }
};

export let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!-_%*?&])[A-Za-z\d@$!-_%*?&]{8,}$/;

yup.addMethod(yup.string, "email", function validateEmail(message) {
  return this.matches(emailRegex, {
    message,
    name: "email",
    excludeEmptyString: true,
  });
});

let nameAndEmailValidation = {
  email: yup.string().email("Invalid email!").required("All fields are required!"),
  password: yup
    .string()
    .required("All fields are required!")
    .min(8, "Password should be at least 8 chars long!")
    .matches(passwordRegex, "Password is too simple."),
};

let newUserSchema = {
  name: yup.string().required("All fields are required!"),
  ...nameAndEmailValidation,
};

export let newBuyerSchema = yup.object({
  ...newUserSchema,
  address: yup.string().required("All fields are required!"),
  city: yup.string().required("All fields are required!"),
  longitude: yup.string().required("All fields are required!"),
  latitude: yup.string().required("All fields are required!"),
});

export let updateBuyerSchema = yup.object({
  email: yup.string().email("Invalid email!").required("All fields are required!"),
  name: yup.string().required("All fields are required!"),
  address: yup.string().required("All fields are required!"),
  city: yup.string().required("All fields are required!"),
  longitude: yup.string().required("All fields are required!"),
  latitude: yup.string().required("All fields are required!"),
});

export let updateSchema = yup.object({
  email: yup.string().email("Invalid email!").required("All fields are required!"),
  name: yup.string().required("All fields are required!"),
});

export let newSellerSchema = yup.object({
  ...newUserSchema,
  description: yup.string().required("All fields are required!"),
});

export let newDriverSchema = yup.object({
  ...newUserSchema,
});

export let signInSchema = yup.object({
  ...nameAndEmailValidation,
});

export let newProductSchema = yup.object({
  name: yup.string().required("All fields are required!"),
  description: yup.string().required("All fields are required!"),
  category: yup.string().required("All fields are required!"),
  price: yup
    .string()
    .transform((value) => {
      if (isNaN(+value)) return "";

      return value;
    })
    .required("All fields are required!"),
  quantity: yup
    .string()
    .transform((value) => {
      if (isNaN(+value)) return "";

      return value;
    }).required("All fields are required!"),
});
