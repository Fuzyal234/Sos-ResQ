import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

class S3Service {
    private s3Client: S3Client
    constructor() {
        const region = process.env.AWS_S3_REGION;
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

        if (!region || !accessKeyId || !secretAccessKey) {
            throw new Error("Missing required environment variables for S3 client");
        }

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        })
    }

    async uploadFile(fileBuffer: Buffer, fileName: string) {
        console.log("fileBuffer in upload function", fileBuffer);
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer
        };
        const command = new PutObjectCommand(params);
        console.log("command", command);
        await this.s3Client.send(command);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
        return fileUrl

    }
}

export default new S3Service();