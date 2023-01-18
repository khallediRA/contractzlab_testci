import { config } from "../config";

import jwt from "jsonwebtoken"
import CryptoJS from "crypto-js";
import { Router, Request, RequestHandler } from "express";

import { KishiModel } from "../sequelize";

import { ExternalToken, User } from "../models";
import { IUser } from "../interfaces";
import { ExternalAuthService, ExternalTokenType } from "./externalAuth";
import { randomUUID } from "crypto";

const { auth: { tokenSecret, passwordSecret, lockIp, tokenExpiration, signUpTypes } } = config;

type TokenDecode = { id: any, date: number, type: IUser["UserType"], ip?: string, }
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
		const { ip, id, date, type } = decoded as any
		return { ip, id, date, type }
	}
	static generateToken(user: IUser, req: Request) {
		let payload: TokenDecode = { id: user.id, date: Date.now(), type: user.UserType }
		if (lockIp) {
			const ip = req.header('x-forwarded-for') || req.ip;
			payload.ip = ip
		}
		let token = jwt.sign(payload, tokenSecret, { expiresIn: tokenExpiration });
		return token
	}
	static async verifyInternalToken(req: Request): Promise<User> {
		const token = req.headers["user-token"] as string
		const reqIp = req.header('x-forwarded-for') || req.ip;
		const decoded = this.decodeToken(token)
		const { ip, id, date } = decoded
		const user = await User.findByPk(id)
		if (!user) throw { message: `User Not Found`, status: 401 }
		const { activated, passwordChangedDate, logoutDate } = user as IUser
		if (activated == false) {
			throw { message: `User Not Activated`, status: 401 }
		}
		if (passwordChangedDate && date < passwordChangedDate.getTime()) {
			throw { message: `User Password Changed`, status: 401 }
		}
		if (logoutDate && date < logoutDate.getTime()) {
			throw { message: `User LogedOut`, status: 401 }
		}
		if (lockIp && reqIp != ip) {
			throw { message: `Unvalid IP`, status: 401 }
		}
		return user
	}
	static async verifyExternalToken(req: Request): Promise<User> {
		const externalToken = req.headers["x-external-token"] as string
		const reqIp = req.header('x-forwarded-for') || req.ip;
		const token = await ExternalToken.findOne({ where: { token: externalToken } }) as any
		const { ip = "", userId = "", expiresAt = 0, createdAt = 0 } = token
		const user = await User.findByPk(userId)
		if (!user) throw { message: `User Not Found`, status: 401 }
		const { activated, passwordChangedDate, logoutDate } = user as IUser
		if (activated == false) {
			throw { message: `User Not Activated`, status: 401 }
		}
		if (expiresAt < Date.now()) {
			throw { message: `ExternalToken Expired`, status: 401 }
		}
		if (passwordChangedDate && createdAt < passwordChangedDate.getTime()) {
			throw { message: `User Password Changed`, status: 401 }
		}
		if (logoutDate && createdAt < logoutDate.getTime()) {
			throw { message: `User LogedOut`, status: 401 }
		}
		if (lockIp && reqIp != ip) {
			throw { message: `Unvalid IP`, status: 401 }
		}
		return user
	}
	static async verifyToken(req: Request): Promise<User> {
		const internalToken = req.headers["user-token"] as string
		const externalToken = req.headers["x-external-token"] as string
		if (!(internalToken || externalToken))
			throw { message: `No Token provided`, status: 401 }
		if (internalToken)
			return await this.verifyInternalToken(req)
		return await this.verifyExternalToken(req)
	}

	static signIn: RequestHandler = async (req, res, next) => {
		try {
			const { email, password } = req.body;
			const user = await User.findOne({ ...User.PathsToFindOptions(["id", "email", "password", "UserType", "activated",]), where: { email } });
			if (!user) throw { message: "Authentication Failed", status: 401 };
			const decryptedPassword = decodePasswordFront(password);
			let passwordIsValid = user.comapre("password", decryptedPassword)
			if (!passwordIsValid) throw { message: "Authentication Failed", status: 401 };
			if (!(user as any).activated) throw { message: "User Not Active", status: 401 };
			const Model = User.sequelize?.models[(user as any).UserType] as typeof KishiModel
			const row = await Model.findByPk(user.id, Model.SchemaToFindOptions("nested", true)) as KishiModel
			const token = UserAuthService.generateToken(user, req)
			const view = row.toView()
			res.status(200).send({ token, user: view });
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static signUp: RequestHandler = async (req, res, next) => {
		try {
			const data = req.body as IUser;
			const type = data.UserType as string
			if (!signUpTypes.includes(type))
				throw `Unvalid signUpType ${type}`
			const Model = User.sequelize?.models[type] as typeof KishiModel
			let createData = Model.fromView(data)
			const decryptedPassword = decodePasswordFront(req.body.password);
			createData.User.password = decryptedPassword
			const createdInstance = await Model.Create(createData) as KishiModel
			if (!createdInstance) throw { message: "SignUp Failed", status: 400 };
			const row = await Model.findByPk(createdInstance.id, Model.SchemaToFindOptions("nested", true)) as KishiModel
			const user = (row as any).User as User
			let token = UserAuthService.generateToken(user, req)
			res.status(200).send({ token: token, user: row.toView() });
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static signInExternal: RequestHandler = async (req, res, next) => {
		try {
			const accessToken = req.body.accessToken as string
			const accessTokenType = req.body.accessTokenType as ExternalTokenType
			const token = accessToken
			const verification = await ExternalAuthService.VerifyExternalToken(accessToken, accessTokenType)
			if (!verification)
				throw { message: `Token Verification Failed`, status: 400 }
			const { email } = verification
			const ip = req.header('x-forwarded-for') || req.ip;
			const user = await User.findOne({ ...User.PathsToFindOptions(["id", "email", "UserType", "activated",]), where: { email } });
			if (!user) throw { message: "Authentication Failed", status: 401 };
			if (!(user as any).activated) throw { message: "User Not Active", status: 401 };
			const { UserType } = user as IUser
			await ExternalToken.create({
				ip, token, UserType, userId: user.id,
			})
			const Model = User.sequelize?.models[(user as any).UserType] as typeof KishiModel
			const row = await Model.findByPk(user.id, Model.SchemaToFindOptions("nested", true)) as KishiModel
			const view = row.toView()
			res.status(200).send({ token, user: view });
		} catch (error) { console.error(error); res.status((error as any)?.status || 400).send(error) }
	};
	static signUpExternal: RequestHandler = async (req, res, next) => {
		try {
			const accessToken = req.body.accessToken as string
			const accessTokenType = req.body.accessTokenType as ExternalTokenType
			const ip = req.header('x-forwarded-for') || req.ip;
			const data = req.body as IUser;
			const UserType = data.UserType as string
			if (!signUpTypes.includes(UserType))
				throw `Unvalid signUpType ${UserType}`
			const Model = User.sequelize?.models[UserType] as typeof KishiModel
			if (!accessToken)
				throw { message: `No ExternalToken provided`, status: 401 }
			const verification = await ExternalAuthService.VerifyExternalToken(accessToken, accessTokenType)
			if (!verification)
				throw { message: `Token Verification Failed`, status: 400 }
			data.email = verification.email
			let createData = Model.fromView(data)
			const token = accessToken
			createData.User.password = randomUUID()
			const createdInstance = await Model.Create(createData) as KishiModel
			if (!createdInstance) throw { message: "SignUp Failed", status: 400 };
			await ExternalToken.create({
				ip, token, UserType, userId: createdInstance.id,
			})
			const row = await Model.findByPk(createdInstance.id, Model.SchemaToFindOptions("nested", true)) as KishiModel
			res.status(200).send({ token, user: row.toView() });
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
		router.post("/externalAuth/signIn", this.signInExternal)
		router.post("/externalAuth/signUp", this.signUpExternal)
		router.get("/auth/", this.verifyUser)
		router.post('/auth/changePassword', this.changePassword)
	}
}

