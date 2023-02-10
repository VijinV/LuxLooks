var nameerror = document.getElementById("nameerror");
var emailerror = document.getElementById("emailerror");
var passworderror = document.getElementById("passworderror");
var confirmpasserror = document.getElementById("confirmpasserror");
var submiterror = document.getElementById("submiterror");
var loginError = document.getElementById("loginerror");

function validateName() {
  var name = document.getElementById("usrname").value;

  if (name.length == 0) {
    nameerror.innerHTML = "Name is required";
    return false;
  }

  if (!name.match(/^[A-Za-z]*\s{1}[A-Za-z]*$/)) {
    nameerror.innerHTML = "Write Full name";

    return false;
  }
  nameerror.innerHTML = "";
  return true;
}

function validateEmail() {
  var email = document.getElementById("usremail").value;

  if (email.length == 0) {
    emailerror.innerHTML = "Please Enter a email";
    return false;
  }

  if (!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
    emailerror.innerHTML = "Please Enter a Valid Email";

    return false;
  }
  emailerror.innerHTML = "";
  return true;
}

function validatePassword() {
  var password = document.getElementById("password").value;
  //   if (password.length == 0) {
  //     subjecterror.innerHTML = "Enter a password";

  //     return false;
  //   }

  //   var max = 8;
  //   var plen = password.length;

  //   if (plen < max) {
  //     passworderror.innerHTML = "Min 8 characters required";

  //     return false;
  //   }

  if (password.length < 8) {
    passworderror.innerHTML =
      "the Password must Contains Numbers,Special Characters and Alphabets";

    return false;
  }
  //   if (!/\d/.test(password)) {
  //     passworderror.innerHTML =
  //     "the Password must Contains Numbers,Special Characters and Alphabets";

  //     return false;
  //   }
  //   if (!/[a-z]/.test(password)) {
  //     passworderror.innerHTML =
  //       "the Password must Contains Numbers,Special Characters and Alphabets";

  //     return false;
  //   }
  //   if (!/[A-Z]/.test(password)) {
  //
  //       "the Password must Contains Numbers,Special Characters and Alphabets";

  //     return false;
  //   }
  passworderror.innerHTML = "";

  return true;
  //   if (!password.match(/^[A-Za-z\._\-[0-9]*[A-Za-z]*[\.][a-z]{2,4}$/)) {
  //     passworderror.innerHTML =
  //       "the Password must Contains Numbers,Special Characters and Alphabets";

  //     return false;
  //   }
  //  subjecterror.innerHTML = 'valid'
}

function validateConfirmPassword() {
  var confirmpass = document.getElementById("confirmpass");
  var password = document.getElementById("password").value
  if (confirmpass == password) {
    confirmpasserror.innerHTML = "Password does not match";
    return false;
  }
  confirmpasserror.innerHTML = "";
  return true;
}

function validatePhoneNumber() {
  var phoneNumber = document.getElementById("phone").value;

  //   var expr = /^[6-9][0-9]{9}$/;
  //   if (!expr.test(phoneNumber)) {
  //     phoneerror.innerHTML = "Invalid Mobile Number.";

  //
  //   }

  var phonelen = phoneNumber.length;

  if (phonelen > 10 || phonelen < 10) {
    phoneerror.innerHTML = "Invalid Mobile Number.";
    return false;
  }
  phoneerror.innerHTML = "";
  return true;
}

function validateSubmit() {
  if (
    !validateEmail() ||
    !validatePassword() ||
    !validateName() ||
    !validatePhoneNumber() ||
    !validateConfirmPassword
  ) {
    submiterror.innerHTML = "Please fill the form";

    return false;
  }
}

function validateLoginSubmit() {
  if (!validatePassword() || !validateEmail()) {

    loginError.innerHTML = "Please fill the form";


    
  }
}