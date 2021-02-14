import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import mongoose, { connect } from 'mongoose';
global.fetch = require("node-fetch");
global.crypto = require('crypto');
import userRoute from './routes/user';
import authRoute from './routes/auth';
import siteRoute from './routes/site';
import systemRoute from './routes/system';
import statusRoute from './routes/status';
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

app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/sites', siteRoute);
app.use('/systems', systemRoute);
app.use('/statuses', statusRoute);
app.use('/faults', faultRoute);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.axy2i.mongodb.net/leevdb?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log(`connected to DB`);
})



app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`)
});