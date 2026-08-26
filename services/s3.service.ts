import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

class S3Service {
  private s3;

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
      region: process.env.AWS_BUCKET_REGION as string,
    });
  }

  async uploadFile({
    content,
    key,
    contentType,
  }: {
    content: any;
    key: string;
    contentType: string;
  }) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: content,
        ContentType: contentType,
      };

      const command = new PutObjectCommand(params);

      await this.s3.send(command);

      // generates url
      return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw error;
    } finally {
    }
  }
}

export default S3Service;
