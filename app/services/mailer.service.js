const nodemailer = require('nodemailer');
const Email = require('email-templates');

const transporterOptions = process.env.NODE_ENV === 'production' ?
    {
        service: 'Gmail',
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PWD
        },
    } :
    {
        port: 1025,
        tls: {
            rejectUnauthorized: false
        }
    };

const transporter = nodemailer.createTransport(transporterOptions);

const mailerService = {
    sendResetPassword: async (email, resetKey, success) => {
        try {
            const html = new Email();
            const signupLink = process.env.NODE_ENV === 'production' ? 'https://teacup.minervas.space'
                : 'http://localhost:3000/';
            const resetLink = process.env.NODE_ENV === 'production' ? `https://teacup.minervas.space/reset/${resetKey}`
                : `http://localhost:3000/reset/${resetKey}`;


            const emailTemplate = await html.render('forgotPwd', {
                success,
                link: success ?
                    resetLink :
                    signupLink
            });

            const text = success ?
                `Bonjour !\n\nNous avons reçu une demande de modification de mot de passe pour votre compte TeaCup associé à cette adresse email.\nAucune modification n'a encore été apportée, rendez-vous à l'adresse ci-dessous pour réinitialiser votre mot de passe:\n${resetLink}\nSi vous n'êtes pas à l'origine de cette requête, veuillez ne pas tenir compte de ce message.\n\nL'équipe TeaCup` :
                `Bonjour !\n\nNous avons reçu une demande de modification de mot de passe pour votre compte TeaCup associé à cette adresse email.\nMalheureusement il semblerait qu'aucun compte n'existe pour cette adresse. Essayez une autre adresse email ou créez un compte avec celle-ci en vous rendant à l'adresse ci-dessous:\n${signupLink}\nSi vous n'êtes pas à l'origine de cette requête, veuillez ne pas tenir compte de ce message.\n\nL'équipe TeaCup`;

            transporter.sendMail({
                from: 'TeaCup <teacup.infocontact@gmail.com>',
                to: email,
                subject: "Mot de passe oublié ?",
                text,
                html: emailTemplate
            });


        } catch (error) {
            console.log('hey')
            console.error(error);

            const message = error.parent?.detail || error.message
            res.status(400).json({ message });
        }
    }
};

module.exports = mailerService;