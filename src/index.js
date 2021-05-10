import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config.js';
import express from 'express';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import assetRoute from './routes/asset';
import authRoute from './routes/auth';
import docRoute from './routes/document';
import faultRoute from './routes/fault';
import statusRoute from './routes/status';
import systemRoute from './routes/system';
import taskRoute from './routes/task';
import tenantRoute from './routes/tenant';
import userRoute from './routes/user';
import mapRoute from './routes/map';
import roleRoute from './routes/role';
import notificationRoute from './routes/notification';
import path from 'path';
import cron from 'node-cron';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-express-middleware';
import Backend from 'i18next-node-fs-backend';
import en from './locales/en/translation.json';
import he from './locales/he/translation.json';
global.fetch = require('node-fetch');
global.crypto = require('crypto');
global.appRoot = path.resolve(__dirname);
global.publicFolder = path.join(process.cwd(), '/public');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(process.cwd() + '/public'));

i18next
	.use(i18nextMiddleware.LanguageDetector)
	.init({
		resources: {
			en: {
				translation: en
			},
			he: {
				translation: he
			}
		},
		detection: {
		order: ['querystring', 'cookie'],
		caches: ['cookie']
		},
		preload: ['en', 'he'],
		saveMissing: true,
		fallBackLng: ['he']
	}, function(err, t) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('i18n loaded')
        
    });

app.use(i18nextMiddleware.handle(i18next));

app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/assets', assetRoute);
app.use('/systems', systemRoute);
app.use('/statuses', statusRoute);
app.use('/faults', faultRoute);
app.use('/tenants', tenantRoute);
app.use('/tasks', taskRoute);
app.use('/documents', docRoute);
app.use('/notifications', notificationRoute);
app.use('/map', mapRoute);
app.use('/roles', roleRoute);

mongoose.connect(
	`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.axy2i.mongodb.net/leevdb?retryWrites=true&w=majority`,
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

app.listen(process.env.PORT, () => {
	console.log(`listening on ${process.env.PORT}`);
});
