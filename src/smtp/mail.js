import path from 'path';
import nodemailer from 'nodemailer';
const hbs = require('nodemailer-express-handlebars');



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
            
            const handlebarOptions = {
                viewEngine: {
                  extName: '.hbs',
                  partialsDir: 'views',//your path, views is a folder inside the source folder
                  layoutsDir: 'views',
                  defaultLayout: ''//set this one empty and provide your template below,
                },
                viewPath: 'views',
                extName: '.hbs',
              };

            transport.use('compile', hbs({
                viewEngine: {
                    partialsDir: 'templates',//your path, views is a folder inside the source folder
                    layoutsDir: 'templates',
                    defaultLayout: ''//set this one empty and provide your template below,
                  },
                viewPath: path.resolve(__dirname, 'templates')
            }));
            resolve(transport);
        } catch(e) {
            reject({
                message: 'Could not create mail transport.'
            });
        }       
    });
}



