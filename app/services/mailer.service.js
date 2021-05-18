const nodemailer = require('nodemailer');

const mailerService = {
    test: async (email) => {
        try {
            const testAccount = await nodemailer.createTestAccount();

            // const transporter = nodemailer.createTransport({
            //     host: "smtp.ethereal.email",
            //     port: 587,
            //     secure: false, // true for 465, false for other ports
            //     auth: {
            //         user: testAccount.user,
            //         pass: testAccount.pass
            //     },
            // });

            const transporter = nodemailer.createTransport({
                port: 1025,
                tls: { rejectUnauthorized: false }

                // secure: false, // true for 465, false for other ports
                // auth: {
                //     user: testAccount.user,
                //     pass: testAccount.pass
                // },
            });

            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: 'TeaCup <ne_pas_repondre@gmail.com>',
                to: email,
                subject: "Forgotten password", // Subject line
                text: "Forgotten password", // plain text body
                html: "<b>Forgotten password</b>", // html body
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        } catch (error) {
            console.log(error)

        }
    }
};

module.exports = mailerService;