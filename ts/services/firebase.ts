import { config } from "../config";

import firebase from 'firebase/app';
import Auth from 'firebase/auth';

const { firebase: fb } = config

const app = firebase.initializeApp(fb);
const auth = Auth.getAuth(app)
let providers = {
	email: new Auth.EmailAuthProvider(),
	google: new Auth.GoogleAuthProvider(),
	github: new Auth.GithubAuthProvider(),
	twitter: new Auth.TwitterAuthProvider(),
}
providers.google.addScope("profile")
providers.google.addScope("email")

export class FirebaseService {
	get app() {
		return app
	}
	get auth() {
		return auth
	}
	static async SignInWithRedirect(api: keyof typeof providers) {
		Auth.signInWithRedirect(auth, providers[api])
		const result = await Auth.getRedirectResult(auth)
		if (result?.user)
			return result.user
		return null
	}
	static async SignInWithPopup(api: keyof typeof providers) {
		const result = await Auth.signInWithPopup(auth, providers[api])
		const { user } = result
		return user
	}
}
