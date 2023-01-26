const accountSid = "ACea127b36d8d84e595ae6350f5e30a5f2";
const authToken = "6eac483dcb28adbd88924a76f4d2a442";
const verifySid = "VAd5a3e056c95bb955802a7a794361e98f";
const client = require("twilio")(accountSid, authToken);

const express = require('express')


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