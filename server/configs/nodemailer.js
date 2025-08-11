const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:"smtp-relay.brevo.com",
    port:587,
    auth:{
        user:process.env.SENDER_USER,
        pass:process.env.SENDER_PASS
    },
})

const sendEmail = async({to,subject,body})=>{
    const response = await transporter.sendMail({
        from:process.env.SENDER_EMAIL,
        to,
        subject,
        html:body
    })
    return response

}
module.exports =sendEmail