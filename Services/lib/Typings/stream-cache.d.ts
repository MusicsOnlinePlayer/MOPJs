declare module "stream-cache" {
	export default (await import("stream")).Transform;
}

declare module "send-seekable" {
	export default any;
}
