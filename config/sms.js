const accountSid = "AC59cd9faa829a204c74b3e1542c7845e3";
const authToken = "f48a2ec7dd4759a29894866e3c2fe0ee";
const verifySid = "ZSfc01171e3598fcb464df2944a487585c";
const client = require("twilio")(accountSid, authToken);

const express = require('express')
// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure


module.exports={
  sentotp :(number) =>{
    client.verify.v2 
  .services(verifySid)
  .verifications.create({ to: `+91 ${number} `, channel: "sms" })
 },
    check: async (otpCode,number) => {
          try{
    const status = await client.verify.v2
              .services(verifySid)
              .verificationChecks.create({ to: `+91 ${number}`, code: otpCode });
               return status
          }catch(err){
              console.log(err);
          }   
      }
    }