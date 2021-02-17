declare module "mongoose" {
	// methods
	export interface PassportLocalDocument extends Document {
		setPassword(pass: string, cb: (err: any) => void);
	}

	// statics
	export interface PassportLocalModel<T extends PassportLocalDocument>
		extends Model<T> {
		authenticate(
			username: string,
			password: string,
			cb: (err: any) => void
		);
	}

	// plugin options
	export interface PassportLocalOptions {
		usernameField?: string;
		usernameLowerCase?: boolean;
	}

	export interface PassportLocalSchema extends Schema {
		plugin(
			plugin: (
				schema: PassportLocalSchema,
				options?: PassportLocalOptions
			) => void,
			options?: PassportLocalOptions
		): Schema;
	}

	export function model<T extends PassportLocalDocument>(
		name: string,
		schema?: PassportLocalSchema,
		collection?: string,
		skipInit?: boolean
	): PassportLocalModel<T>;
}

declare module "passport-local-mongoose" {
	const p: (
		schema: import("mongoose").Schema,
		Options?: Record<string, unknown>
	) => void;
	export = p;
}

declare module "passport" {
	const p: (
		req: import("express").Request,
		res: import("express").Response,
		next: import("express").NextFunction
	) => void;
	const authenticate: (type: string) => typeof p;
	export default {
		authenticate,
	};
}

declare namespace Express {
	export interface Request {
		user?: import("../Models/Users").IUser;
		logIn: (
			userToLogin: import("../Models/Users").IUser,
			cb: (err: Error) => void
		) => void;
		logout: () => void;
	}

	export interface Response {
		sendSeekable?: (
			readStream: import("stream").Stream,
			options: { type: string; length: number }
		) => void;
	}
}
