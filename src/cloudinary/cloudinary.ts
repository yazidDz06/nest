import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
//ce provider sert a initialiser cloudinary une seule fois
export const CloudinaryProvider: Provider = {
    //provider ici sera utilisé dans le service
  provide: 'CLOUDINARY',
  useFactory: (config: ConfigService) => {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
    return cloudinary;
  },
  inject: [ConfigService],
};

