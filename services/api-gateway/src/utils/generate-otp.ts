import otpGenerator from "otp-generator";

export const generateOTP = () =>
  otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
