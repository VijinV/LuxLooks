const fast2sms = require("fast-two-sms");
const otplib = require('otplib');
require("dotenv").config();

const secret = otplib.authenticator.generateSecret();

// Generate an OTP
const token = otplib.authenticator.generate(secret);



const sendMessage = function (mobile, res, next) {
//  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization :process.env.SMS_API,
    message: `your OTP verification code is ${token}`,
    // message: "",
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return token;
};


module.exports = {
  sendMessage,
};
