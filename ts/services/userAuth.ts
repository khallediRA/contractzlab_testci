import { config } from "../config";

import jwt from "jsonwebtoken"
import CryptoJS from "crypto-js";
import { Router, Request, RequestHandler } from "express";

import { CrudOptions, KishiModel } from "../sequelize";

import { User } from "../models";
import { IUser } from "../interfaces";
import { FindOptions } from "sequelize";
import { Middleware } from "../utils/middleware";

const { auth: { tokenSecret, passwordSecret, lockIp, tokenExpiration, signUpTypes } } = config;

type TokenDecode = { ip: string, userId: any, date: Date }
function decodePasswordFront(password: string) {
	if (!passwordSecret) return password;
	const obj = JSON.parse(CryptoJS.AES.decrypt(password, passwordSecret).toString(CryptoJS.enc.Utf8));
	return obj.password;
}
export class UserAuthService {
	static decodeToken(token: string): TokenDecode {
		if (!token) throw { message: `Token Not Found`, status: 401 }
		const decoded = jwt.verify(token, tokenSecret) as jwt.JwtPayload
		if (!decoded) throw { message: `Unvalid Token`, status: 401 }
		const { ip, userId, date } = decoded as any
		return { ip, userId, date: new Date(date) }
	}
	static generateToken(user: User, req: Request) {
		const ip = req.header('x-forwarded-for') || req.ip;
		let token = jwt.sign({ userId: user.id, date: new Date(), ip } as TokenDecode, tokenSecret, { expiresIn: tokenExpiration });
		return token
	}
	static async verifyToken(req: Request): Promise<User> {
		const reqIp = req.header('x-forwarded-for') || req.ip;
		const token = req.headers["user-token"] as string
		const decoded = this.decodeToken(token)
		const { ip, userId, date } = decoded
		const user = await User.findByPk(userId)
		if (!user) throw { message: `User Not Found`, status: 401 }
		const { activated, passwordChangedDate, logoutDate } = user as IUser
		if (activated == false) {
			throw { message: `User Not Activated`, status: 401 }
		}
		if (passwordChangedDate && date < passwordChangedDate) {
			throw { message: `User Password Changed`, status: 401 }
		}
		if (logoutDate && date < logoutDate) {
			throw { message: `User LogedOut`, status: 401 }
		}
		if (lockIp && reqIp != ip) {
			throw { message: `Unvalid IP`, status: 401 }
		}
		return user
	}
	static signIn: RequestHandler = async (req, res, next) => {
		try {
			const { email, password } = req.body;
			const user = await User.findOne({ ...User.PathsToFindOptions(["*"]), where: { email } });
			if (!user) throw { message: "Authentication Failed", status: 401 };
			const decryptedPassword = decodePasswordFront(password);
			let passwordIsValid = user.comapre("password", decryptedPassword)
			if (!passwordIsValid) throw { message: "Authentication Failed", status: 401 };
			if (!(user as any).activated) throw { message: "User Not Active", status: 401 };
			let token = UserAuthService.generateToken(user, req)
			const view = user.toView()
			res.status(200).send({ token: token, user: view });
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static signUp: RequestHandler = async (req, res, next) => {
		try {
			const data = req.body;
			const type = req.query["type"] as string
			if (!signUpTypes.includes(type))
				throw `Unvalid signUpType ${type}`
			const Model = User.sequelize?.models[type] as typeof KishiModel
			const createdInstance = await Model.Create(data) as KishiModel
			if (!createdInstance) throw { message: "SignUp Failed", status: 400 };
			const row = await Model.findByPk(createdInstance.id, Model.SchemaToFindOptions("nested", true)) as KishiModel
			const user = (row as any).User as User
			let token = UserAuthService.generateToken(user, req)
			res.status(200).send({ token: token, user: row.toView() });
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static verifyUser: RequestHandler = async (req, res, next) => {
		try {
			const user = await UserAuthService.verifyToken(req)
			if (!user) throw { message: "SignUp Failed", status: 400 };
			const view = user.toView()
			res.status(200).send({ user: view });
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static changePassword: RequestHandler = async (req, res, next) => {
		try {
			let user = await UserAuthService.verifyToken(req)
			if (!user) throw { message: "SignUp Failed", status: 400 };
			let { oldPassword, password } = req.body
			const decryptedPassword = decodePasswordFront(oldPassword);
			let passwordIsValid = user.comapre("password", decryptedPassword)
			if (!passwordIsValid) {
				return res.status(400).send('Current Password is not valid')
			}
			await user.update({ password })
			res.status(200).send({ msg: "ok" })
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static Init(models: { [name: string]: typeof KishiModel }, router: Router) {
		for (const signUpType of signUpTypes) {
			const Model = models[signUpType]
			if (!(Model?.ParentModel == User))
				throw `Unvalid signUpType ${signUpType}`
		}
		router.post("/auth/signIn", this.signIn)
		router.post("/auth/signUp", this.signUp)
		router.get("/auth/", this.verifyUser)
		router.post('/auth/changePassword', this.changePassword)
	}
}

