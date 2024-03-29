import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";
import fs from "fs";
import path from "path";
import {
	generateAccessToken,
	authenticate,
	genereateResetPasswordUrl,
} from "./auth.service";
import { sendMail } from "../smtp/mail";
import { relocateFile } from "../api/generic";
import { isUserRelated } from "../middleware/authorize";
import { removeFileFromBlob, uploadFilesToBlob } from "../api/blobApi";
import Tenant from "../models/tenant";
import { checkAssetOwnership } from "./asset.service";
import { removeSystemOwnership } from "./system.service";
import { removeFaultOwnership } from "./fault.service";
import Location from "../models/location";

export const registerUser = async (req) => {
	let {
		email,
		password,
		firstName,
		lastName,
		phoneNumber,
		birthDate,
		employedBy,
		role,
		lang,
		data,
	} = req.body;
	const { tenant, _id: createdBy } = req.user;
	let errors = await checkUnique(req);
	if (errors.email) {
		return errors;
	}

	let salt = await bcrypt.genSalt(10);
	if (!password) {
		password = "password";
	}

	let t = await Tenant.findOne({ _id: tenant });
	const hashedPassword = await bcrypt.hash(password, salt);

	let user = new User({
		tenant,
		email,
		password: hashedPassword,
		firstName,
		lastName,
		phoneNumber,
		birthDate,
		employedBy,
		createdBy,
		data,
		avatar: req.file ? req.file.filename : null,
		role,
		changePasswordOnFirstLogin: true,
		lang: t.lang,
	});

	let savedUser = await user.save();

	if (savedUser.data.location) {
		await Location.findOneAndUpdate(
			{ _id: savedUser.data.location },
			{ $push: { residents: savedUser._id } }
		);
	}

	const newURL = await uploadFilesToBlob([req.file], "images");
	savedUser.avatar = newURL[0];
	return await savedUser.save();
};

export const updateUserRole = async (req) => {
	const { _id: lastUpdatedBy } = req.user;
	const { user, role } = req.body;
	return await User.findOneAndUpdate(
		{ _id: user },
		{ role, lastUpdatedBy },
		{ useFindAndModify: false, new: true }
	);
};

export const uploadAvatar = async (req) => {
	const { _id: userId } = req.user;
	if (!req.file) return;
	const user = await User.findOne({ _id: userId }, "avatar");
	if (!user) return;

	const newURL = await uploadFilesToBlob([req.file], "images");
	return await User.findOneAndUpdate(
		{ _id: userId },
		{ avatar: newURL[0] },
		{ new: true }
	);
};

export const updateUserData = async (req) => {
	let {
		userId,
		email,
		firstName,
		lastName,
		phoneNumber,
		birthDate,
		employedBy,
		role,
		isActive,
		data,
	} = req.body;

	const isRelated = await isUserRelated(
		"users",
		User,
		userId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	const user = await User.findOne({ _id: userId });

	if (user.isActive !== isActive && isActive === false) {
		const ownership = await removeUserOwnerships(userId, req.user._id);
		if (ownership.error) {
			return ownership;
		}
	}

	return await User.findOneAndUpdate(
		{ _id: userId },
		{
			email,
			firstName,
			lastName,
			phoneNumber,
			birthDate,
			employedBy,
			role,
			isActive,
			data,
		},
		{ new: true, useFindAndModify: false }
	).populate("role");
};

export const removeAvatar = async (req) => {
	const { userId } = req.body;
	if (!userId) return;
	const user = await User.findOne({ _id: userId });
	if (!user) return;

	// if (user.avatar) {
	// 	let oldAvatar = user.avatar.replace(process.env.BACKEND_URL, process.env.FS_LOCAL);
	// 	if (fs.existsSync(oldAvatar)) {
	// 		fs.unlinkSync(oldAvatar);
	// 	}
	// }

	return await User.findOneAndUpdate(
		{ _id: userId },
		{ avatar: null },
		{ new: true }
	);
};

export const disableUser = async (req) => {
	const { userId } = req.body;
	return await User.findOneAndUpdate({ _id: userId }, { isActive: false });
};

export const enableUser = async (req) => {
	const { userId } = req.body;
	return await User.findOneAndUpdate({ _id: userId }, { isActive: true });
};

export const checkUnique = async (req) => {
	let errors = { email };
	const email = await User.findOne({ email: req.body.email });

	if (email) {
		errors.email = {
			message: "This email is already in use",
		};
	}

	return errors;
};

export const loginUser = async (req) => {
	const res = await authenticate(req);
	if (!res) return false;
	return {
		auth: true,
		user: res.user,
		message: "Logged in successfully",
		token: res.token,
	};
};

export const reloginUser = async (req) => {
	var token = req.body.token;
	if (!token) return { auth: false, message: "No token provided." };
	let decodedToken;
	try {
		decodedToken = await jwt_decode(token);
	} catch (e) {
		return {
			auth: false,
			message: "could not decode token",
			user: null,
			token: null,
		};
	}
	const user = await User.findOne(
		{ _id: decodedToken.id },
		"_id username firstName lastName email employedBy phoneNumber isActive birthDate avatar tenant role lang isAdmin data"
	).populate("role");
	return jwt.verify(token, process.env.JWT_SECRET, async (err) => {
		if (!user)
			return {
				auth: false,
				message: "user token not linked to a user",
				user: null,
				token: null,
			};
		if (err) {
			if (err.message === "invalid token") {
				return {
					auth: false,
					message: "Invalid token",
					user: null,
					token: null,
				};
			}
			const currentTime = new Date() / 1000;
			const timeDifference = currentTime - decodedToken.exp;
			const refreshToken = req.body.refreshToken;
			const refreshTokenHash = await bcrypt.compare(
				refreshToken,
				decodedToken.refreshTokenHash
			);

			if (
				err.message === "jwt expired" &&
				timeDifference < 86400 &&
				refreshTokenHash
			) {
				const newToken = await generateAccessToken(decodedToken.id);
				return {
					auth: true,
					user: user,
					message: "Refreshed token sent",
					token: newToken,
				};
			}
			return {
				auth: false,
				message: "Failed to authenticate token.",
				user: null,
				token: null,
			};
		}
		return {
			auth: true,
			user,
			message: "User authenticated successfully",
			user,
			token: req.body,
		};
	});
};

export const deactivateUser = async (req) => {
	const { userId } = req.body;
	if (checkAssetOwnership()) {
		return {
			status: 405,
			error: true,
			reason: "cannotDeactivateAssetOwner",
		};
	}
	const user = await User.findOne({ _id: userId });
	await removeUserOwnerships(userId, req.user._id);
};

export const resetPasswordLink = async (req) => {
	const { email } = req.body;
	try {
		let user = await User.findOne({ email });
		if (user) {
			let url = await genereateResetPasswordUrl(user._id);
			let res = await sendMail({
				to: email,
				subject: "Leev - Password reset",
				template: "resetPassword",
				context: {
					text: `Please go to the following link to reset you password`,
					url: url,
				},
			});
			if (res.isError) {
				return res.error;
			}
			return res.data;
		}
		return {
			status: 404,
			message: "user not found",
		};
	} catch (e) {
		console.log(e.message);
		return {
			status: 500,
			message: "System Error",
		};
	}
};

export const setNewPassword = async (req) => {
	const { userId, password } = req.body;
	let user = User.findOne({ _id: userId });

	let salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	return await User.findOneAndUpdate(
		userId,
		{ password: hashedPassword },
		{
			new: true,
		}
	);
};

export const authorizeSetNewPassword = async (req) => {
	const { token } = req.body;
	return jwt.verify(token, process.env.JWT_SECRET, async (err) => {
		let decodedToken;
		try {
			decodedToken = await jwt_decode(token);
			if (!decodedToken) throw "failed to decode";
		} catch (e) {
			return { message: "could not decode token" };
		}
		if (err) {
			if (err.message === "jwt expired") {
				return {
					message: "Password reset request time fream has expired",
				};
			}
		}
		let userId = decodedToken.id;
		return {
			userId,
		};
	});
};

export const extractuserId = async (token) => {
	return jwt.verify(token, process.env.JWT_SECRET, async (err) => {
		let decodedToken;
		try {
			decodedToken = await jwt_decode(token);
			if (!decodedToken) throw "failed to decode";
		} catch (e) {
			return { err, message: "could not decode token" };
		}
		if (err) {
			if (err.message === "jwt expired") {
				return {
					err,
					message: "Password reset request time fream has expired",
				};
			}
		}
		let userId = decodedToken.id;
		return userId;
	});
};

export const getUserList = async (req) => {
	const { tenant } = req.user;

	return User.find(
		{ tenant, "data.isResident": false, "data.isOwner": false },
		"_id firstName lastName phoneNumber avatar employedBy role data isAdmin"
	).populate([{ path: "role", model: "Role", select: "roleName" }]);
};

export const getResidentList = async (req) => {
	const { asset } = req.query;
	const { tenant } = req.user;
	console.log(req.query);
	let filters = {
		tenant,
		$or: [{ "data.isResident": true }, { "data.isOwner": true }],
	};

	if (asset) {
		filters["data.asset"] = asset;
	}
	return User.find(
		filters,
		"_id firstName lastName phoneNumber avatar employedBy role data"
	).populate([{ path: "role", model: "Role", select: "roleName" }]);
};

export const getUsersData = async (req) => {
	const { userList } = req.body;
	return await User.find(
		{ _id: { $in: userList } },
		"_id firstName lastName phoneNumber avatar role isAdmin data"
	).populate("role");
};

export const getUserDataById = async (req) => {
	const { userId } = req.body;

	const isRelated = await isUserRelated(
		"users",
		User,
		userId,
		req.user._id,
		req.headers.permLevel
	);

	if (!isRelated) {
		return { error: true, reason: "unauthorized", status: 403 };
	}

	let user = await User.findOne(
		{ _id: userId },
		"_id tenant firstName lastName email phoneNumber birthDate employedBy avatar role isActive data isAdmin"
	).populate("role");

	user = user.toObject();

	if (!user.data) {
		user.data = { isResident: false, isOwner: false };
	}

	return user;
};

export const verifyEmailExists = async (req) => {
	const { email } = req.body;
	let user = await User.find({ email });
	if (!user.length) {
		return {
			error: true,
			reason: "Email not found",
			status: 200,
		};
	}
	return {
		error: false,
		status: 200,
		reason: "Email found successfully",
		userId: user[0]._id,
	};
};

export const removeUserOwnerships = async (userId, actionBy) => {
	const ow = await checkAssetOwnership(userId);
	if (ow) {
		return {
			status: 405,
			error: true,
			reason: "cannotDeactivateAssetOwner",
		};
	}
	await removeSystemOwnership(userId, actionBy);
	await removeFaultOwnership(userId, actionBy);
	return { error: false };
};

export const verifyResetPasswordHandle = async (req) => {
	const { handle } = req.body;
	return await extractuserId(handle);
};
