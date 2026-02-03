import {
  choices,
  email,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  regex,
  required,
} from "react-admin";

const validateFirstName = [required(), minLength(2), maxLength(15)];
const validateEmail = email();
const validateAge = [number(), minValue(18), maxValue(100)];
const validateZipCode = regex(/^\d{5}$/, "Must be a valid Zip Code");
const validateSex = choices(["M", "F"], "Must be Male or Female");

export {
  validateAge,
  validateEmail,
  validateFirstName,
  validateSex,
  validateZipCode,
};
