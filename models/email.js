const nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
class Email {
  constructor(message, reciever, themeMessage, froms) {
    if (!message) message = ``;

    if (!reciever || process.env.NODE_ENV != "production")
      reciever =
        "OUalesh@alseco.kz;anauryzbayev@alseco.kz;IBiyaliev@alseco.kz;ESeitkazinov@alseco.kz;AAAssilkhan@alseco.kz";
    if (!themeMessage) themeMessage = "Восстановление пароля";

    if (!froms) froms = '"Smart portal " <sender@alseco.kz>';

    this.message = message;
    this.reciever = reciever;
    this.themeMessage = themeMessage;
    this.froms = froms;
  }
  Send() {
    ///SEND EMAIL by NODEMAILER
    let transporter = nodeMailer.createTransport(
      smtpTransport({
        host: "193.150.151.210",
        debug: true,
        port: 25,
        /*auth: {
        user: 'asc\\anauryzbayev',
        pass: '123321Qwe' //triple checked, even tried changing it to something very simple (without any special characters)
            }, */
        tls: {
          rejectUnauthorized: false
        },
        ignoreTLS: true,
        requireTLS: false,
        secure: false
      })
    );
    let mailOptions = {
      // should be replaced with real recipient's account
      from: this.froms, // sender address
      to: this.reciever,
      subject: this.themeMessage,
      html: this.message // html body
    };
    let error;
    try {
      error = transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return error;
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
      });
    } catch (err) {
      return err;
    }
    if (error) return error;
  }
}
module.exports = Email;
