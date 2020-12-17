export interface IDiskMusic {
	title: string,
	album: string,
	artist: Array<string>,
	track: {
		no: number
	},
	picture: Array<{
		data: Buffer,
		format: string
	}>

}
