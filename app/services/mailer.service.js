const nodemailer = require('nodemailer');
const Email = require('email-templates');

const mailerService = {
    test: async (email, success) => {
        try {
            const testAccount = await nodemailer.createTestAccount();

            const transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                },
            });

            // const transporter = nodemailer.createTransport({
            //     port: 1025,
            //     tls: {
            //         rejectUnauthorized: false
            //     }
            // });

            const html = new Email()

            const emailTemplate = await html.render('forgotPwd', {
                success
            });

            const text = success ?
                "Bonjour !\n\nNous avons reçu une demande de modification de mot de passe pour votre compte TeaCup associé à cette adresse email.\nAucune modification n'a encore été apportée, rendez-vous à l'adresse ci-dessous pour réinitialiser votre mot de passe:\nhttp://placeholder.com\nSi vous n'êtes pas à l'origine de cette requête, veuillez ne pas tenir compte de ce message.\n\nL'équipe TeaCup" :
                "Bonjour !\n\nNous avons reçu une demande de modification de mot de passe pour votre compte TeaCup associé à cette adresse email.\nMalheureusement il semblerait qu'aucun compte n'existe pour cette adresse. Essayez une autre adresse email ou créez un compte avec celle-ci en vous rendant à l'adresse ci-dessous:\nhttp://placeholder.com\nSi vous n'êtes pas à l'origine de cette requête, veuillez ne pas tenir compte de ce message.\n\nL'équipe TeaCup";

            const info = await transporter.sendMail({
                from: 'TeaCup <ne_pas_repondre@gmail.com>',
                to: email,
                subject: "Mot de passe oublié ?",
                text,
                html : emailTemplate
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