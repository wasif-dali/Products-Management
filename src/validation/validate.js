const mongoose = require("mongoose");

//--------------------------------email-------------------------------
const isValidEmail = (email) => {
    const regx = /^([a-z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/
    return regx.test(email)
};

//-------------------name--------------
const isValidName = (name) => {
    const regx = /^[A-Za-z\\s]+$/
    return regx.test(name)
};


// ---------------mobile--------------------
const isValidmobile= (data) => {
    const regx = /^((\+91)?|91)?[789][0-9]{9}$/
    return regx.test(data)
};

// --------------body----------------------------
const isValidreqBody=(request)=>{
    return Object.keys(request).length>0
}

const isValidNumber =(number)=>{
    if (number == undefined || number == null) return false
    if (typeof(number)=== Number) return false
    return true
}

const isValidElem= (data) =>{
    if (data == undefined || data == null) return false
    if (typeof(data)==="string" && data.trim()=="" ) return false
    return true
}

// ---------------logo link-----------------------------------
const isValidimage = (logolink)=>{
    let url =/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
    return url.test(logolink)
}

const isvalidpassword =(password) =>{
    let regx =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,15}$/
    return regx.test(password)
}
const  PinCode =(pincode)=>{
    let regx=/^[1-9][0-9]{5}$/
    return regx.test(pincode)
}

module.exports = {  isValidEmail,isValidName,isValidreqBody,isValidElem ,isValidmobile ,isValidimage,isvalidpassword ,PinCode ,isValidNumber}
