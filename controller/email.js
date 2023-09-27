const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.NODEMAILER_EMAILID,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

console.log(process.env.NODEMAILER_EMAILID, process.env.NODEMAILER_PASSWORD)

const URL = 'http://127.0.0.1:5173/enter/'

const send_magic_link = async(email, link, which) => {
  if (which == 'signup') {
    var subj = 'Signup link';
    body = '<p>Hello friend and welcome to our website. This is your link to confirm your account: '+(URL+email+'/'+link)+ '</p><p>Needless to remind you not to share this link with anyone 🤫</p>'
  } else {
    var subj = 'Login link';
    body = '<p>Hello friend and welcome back to our website. This is your link to login: '+(URL+email+'/'+link)+ '</p><p>Needless to remind you not to share this link with anyone 🤫</p>'
  }

  const mailOptions = {
    to: email,
    from: process.env.NODEMAILER_EMAILID,
    subject: subj,
    html: body
  }

  try{
    const response = await transport.sendMail(mailOptions);
    console.log('Link sent');
    return response;
  } catch (err) {
    console.log("Something Went Wrong", err);
    return err;
  }
}

module.exports = {send_magic_link}