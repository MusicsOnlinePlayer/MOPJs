import mongoose from "mongoose";

export const ConnectToDB = (
	MongoUrl: string,
	EnableMongoAuth: boolean = false
): Promise<void> =>
	new Promise((resolve, reject) => {
		mongoose.connect(MongoUrl, {
			useNewUrlParser: true,
			authSource: EnableMongoAuth ? "admin" : undefined,
		});
		const DataBase = mongoose.connection;
		DataBase.on("error", (err) => {
			reject(err);
		});
		DataBase.once("open", () => {
			resolve();
		});
	});
