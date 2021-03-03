import { Client } from 'minio';

const MinioClient = new Client({
	endPoint: 'minio-svc',
	port: 9000,
	useSSL: false,
	accessKey: 'minio',
	secretKey: 'miniomop',
});

export default MinioClient;
