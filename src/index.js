import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import mongoose, { connect } from 'mongoose';
import path from 'path';
global.fetch = require("node-fetch");
global.crypto = require('crypto');
import userRoute from './routes/user';
import authRoute from './routes/auth';
import assetRoute from './routes/asset';
import systemRoute from './routes/system';
import statusRoute from './routes/status';
import tenantRoute from './routes/tenant';
import faultRoute from './routes/fault';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import Grid from 'gridfs-stream';

let gfs;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(process.cwd() +'/public'));



app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/assets', assetRoute);
app.use('/systems', systemRoute);
app.use('/statuses', statusRoute);
app.use('/faults', faultRoute);
app.use('/tenants', tenantRoute);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.axy2i.mongodb.net/leevdb?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });



app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`)
});