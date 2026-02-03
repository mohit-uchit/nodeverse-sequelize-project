const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
   service : 'gmail',
   auth : {
     user : 'newt60420@gmail.com',
     pass : `qpbv zxdw ynuj uzfr`

   }
})

module.exports = transporter