import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadOptions } from './file-upload-options.interface';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    const accessKeyId: string = configService.get('AWS_ACCESS_KEY');
    const secretAccessKey: string = configService.get('AWS_SECRET_ACCESS_KEY');

    const region: string = 'ap-southeast-2';

    const clientConfig: S3ClientConfig = {
      region,
    };

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  async upload({ bucket, key, file }: FileUploadOptions) {
    try {
      this.logger.log(`Uploading file to bucket: ${bucket}, key: ${key}`);

      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file,
        }),
      );

      this.logger.log(`File uploaded successfully to ${bucket}/${key}`);
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error uploading file to S3: ${errorMessage}`,
        errorStack,
      );
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }
  }

  getObjectUrl(bucket: string, key: string) {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}
