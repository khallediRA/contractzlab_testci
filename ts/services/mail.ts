import { config } from "../config";

import { Message, MessageHeaders, SMTPClient } from 'emailjs';
import fs from 'fs';
import ejs from 'ejs';
import generator from 'generate-password';

import { FileLogger } from "../utils/fileLogger";

import { IUser } from "../interfaces";
import { KishiModel } from "../sequelize";
import { Router } from "express";

const { uploadPath, mail: { smtp }, frontEndUrl, frontEndName, server: { publicUrl } } = config

const logger = new FileLogger("mail")
const client = new SMTPClient(smtp);
const folderpath = uploadPath + "/mail"

export class MailService {
	static Init(models: { [name: string]: typeof KishiModel }, router: Router) {
		router.post('/mail/Send', async (req, res) => {
			try {

				const body: any = req.body
				await this.SendMail(body.content, body.email, { subject: body.subject })
				return res.send({ msg: "ok" });
			} catch (error) {
				logger.error(error)
				return res.status(400).send({ error: (error as any).message || error });
			}
		});
	}
	static get client() {
		return client
	}
	static async SaveMail(message: MessageHeaders) {
		const { attachment, to: email } = message
		const content = Array.isArray(attachment) ? attachment[0].data : attachment?.data
		var message_id = generator.generate({
			length: 21,
			numbers: true
		})
		const filename = message_id
		const filepath = folderpath + "/" + email + "/" + filename
		await fs.promises.mkdir(folderpath + "/" + email, { recursive: true })
		fs.writeFileSync(filepath + ".html", content || "", 'utf8');
	}

	static async SendMail(content: string, email: string, { text = "", subject = "" }): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				const message: MessageHeaders = {
					text: text,
					from: smtp.user,
					to: email,
					subject: subject || "No Subject",
					attachment: { data: content, alternative: true },
				}
				client.send(message, (error, msg) => {
					if (error) {
						reject(error)
						return logger.error(error)
					}
					resolve(msg)
					logger.log(`[${email}]:${message.subject}`)
				})
				if (process.env.DEV_MODE)
					this.SaveMail(message)
			} catch (error) { reject(error) }
		})
	}
	static async SendMailTemplate(templatePath: string, email: string, data: any, { text = "", subject = "" }) {
		const content = await ejs.renderFile(templatePath, { ...data, domain: publicUrl, frontEndUrl, frontEndName }) as string
		await this.SendMail(content, email, { text, subject })
	}

	static async SendUserMessage(user: IUser, message: string) {
		await this.SendMailTemplate('./assets/mail/user_message_mail.html', (user as any).email, { user, message }, {})
	}
}