import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config.js";
import express from "express";
import methodOverride from "method-override";
import mongoose from "mongoose";
import assetRoute from "./routes/asset";
import authRoute from "./routes/auth";
import docRoute from "./routes/document";
import faultRoute from "./routes/fault";
import statusRoute from "./routes/status";
import systemRoute from "./routes/system";
import taskRoute from "./routes/task";
import tenantRoute from "./routes/tenant";
import userRoute from "./routes/user";
import mapRoute from "./routes/map";
import roleRoute from "./routes/role";
import locationRoute from "./routes/location";
import notificationRoute from "./routes/notification";
import dashboardRoute from "./routes/dashboard";
import reportsRoute from "./routes/reports";
import path from "path";
import cron from "node-cron";
import i18next from "i18next";
import i18nextMiddleware from "i18next-express-middleware";
import en from "./locales/en/translation.json";
import he from "./locales/he/translation.json";
import { syncRepeatableTasks } from "./services/task.service";
global.fetch = require("node-fetch");
global.crypto = require("crypto");
global.appRoot = path.resolve(__dirname);
global.publicFolder = path.join(process.cwd(), "/public");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(express.static(process.cwd() + "/public"));

i18next.use(i18nextMiddleware.LanguageDetector).init(
	{
		resources: {
			en: {
				translation: en,
			},
			he: {
				translation: he,
			},
		},
		detection: {
			order: ["querystring", "cookie"],
			caches: ["cookie"],
		},
		preload: ["en", "he"],
		saveMissing: true,
		fallBackLng: ["he"],
	},
	function (err, t) {
		if (err) {
			return;
		}
	}
);

app.use(i18nextMiddleware.handle(i18next));

app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/assets", assetRoute);
app.use("/systems", systemRoute);
app.use("/statuses", statusRoute);
app.use("/faults", faultRoute);
app.use("/tenants", tenantRoute);
app.use("/tasks", taskRoute);
app.use("/documents", docRoute);
app.use("/notifications", notificationRoute);
app.use("/map", mapRoute);
app.use("/roles", roleRoute);
app.use("/locations", locationRoute);
app.use("/dashboard", dashboardRoute);
app.use("/reports", reportsRoute);

cron.schedule("0 11 * * *", syncRepeatableTasks);

mongoose.connect(
	`mongodb+srv://${process.env.MONGO_USER}:${
		process.env.MONGO_PASS
	}@cluster0.axy2i.mongodb.net/${
		process.env.DB_NAME || "leevdb"
	}?retryWrites=true&w=majority`,
	{ useNewUrlParser: true, useUnifiedTopology: true, autoIndex: false }
);

app.listen(process.env.PORT, () => {
	console.log(`listening on ${process.env.PORT}`);
});
