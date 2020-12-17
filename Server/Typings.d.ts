declare module 'mongoosastic' {
	export default any;
}

declare module 'stream-cache' {
	export default (await import('stream')).Stream;
}

declare module 'send-seekable' {
	export default any;
}

declare type MmCallback = (err: string, meta) => void;
declare type MmDefault = (rs: ReadStream, mmCallback) => void;

declare module 'musicmetadata' {
	export default mmDefault;
}

declare module 'mongoose' {
	// methods
	export interface PassportLocalDocument extends Document {
		setPassword(pass: string, cb: (err: any) => void);
	}

	// statics
	export interface PassportLocalModel<T extends PassportLocalDocument> extends Model<T> {
		authenticate(username: string, password: string, cb: (err: any) => void);
	}

	// plugin options
	export interface PassportLocalOptions {
		usernameField?: string;
		usernameLowerCase?: boolean;
	}

	export interface PassportLocalSchema extends Schema {
		plugin(
			plugin: (schema: PassportLocalSchema, options?: PassportLocalOptions) => void,
			options?: PassportLocalOptions): Schema;
	}

	export function model<T extends PassportLocalDocument>(
		name: string,
		schema?: PassportLocalSchema,
		collection?: string,
		skipInit?: boolean): PassportLocalModel<T>;
}

declare module 'passport-local-mongoose' {

	const p: (schema: import('mongoose').Schema, Options?: Record<string, unknown>) => void;
	export = p;
}

declare module 'cookie-parser' {
	export default any;
}

declare module 'compression' {
	export default any;
}

declare module 'passport' {
	const p: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void;
	const authenticate: (type: string) => typeof p;
	export default {
		authenticate,
	};
}

declare namespace Express {
	export interface Request {
		user?: import('./Users/Model/Interfaces').IUser,
		logIn: (userToLogin: import('./Users/Model/Interfaces').IUser, cb: (err: Error) => void) => void,
		logout: () => void,
	}

	export interface Response {
		sendSeekable?: (readStream: import('stream').Stream, options: { type: string, length: number }) => void
	}
}
