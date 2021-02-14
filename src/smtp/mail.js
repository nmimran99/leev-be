import nodemailer from 'nodemailer';


export const sendMail = async (mailOptions) => {
    return new Promise(async (resolve, reject) => {
        return createMailTransporter()
        .then( transporter => {
            transporter.sendMail(mailOptions, (error, data) => {
                if (error) {
                    resolve({
                        isError: true,
                        error
                    })
                } else {
                    resolve({
                        isError: false,
                        data, 
                        message: 'Email sent successfully'
                    }) 
                }
            });
        })
        .catch( error => {
            reject({
                isError: true,
                error
            })
        })  
    })
    
}

export const createMailTransporter = async () => {
    return new Promise((resolve, reject) => {
        try {
            let transport = nodemailer.createTransport({
                service: process.env.MAIL_SERVICE,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            });
            resolve(transport);
        } catch(e) {
            reject({
                message: 'Could not create mail transport.'
            });
        }       
    });
}



