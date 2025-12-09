import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinaryClient: typeof cloudinary) {}
//inject dans le constuctor permet d'utiliser cloudinaryClient injecté via token 'CLOUDINARY' et ce dernier correspeand a ce que j'ai defeni dans le provider
 

//cette methode qui ne permet de faire des uploads localement ou par url
//c clair que ca retourne une promise psq on attend une reponse de cloudinary
async uploadImage(filePath: string,options?: UploadApiOptions,): Promise<UploadApiResponse> {
    try {
      return await this.cloudinaryClient.uploader.upload(filePath, options);
    } catch (err) {
      throw new InternalServerErrorException('Cloudinary upload failed');
    }
  }


  //methode qui se base sur public id pour supprimer les images en cloudinary
  async deleteImage(publicId: string) {
    try {
      return await this.cloudinaryClient.uploader.destroy(publicId);
    } catch (err) {
      throw new InternalServerErrorException('Cloudinary delete failed');
    }
  }
}

//voila ce que options (deuxieme arguement de la fonction upload) accepte
/*folder: 'my_app_folder' — rangement dans Cloudinary.

public_id: 'custom-name' — nom personnalisé.

resource_type: 'image' | 'auto' — si tu veux forcer type.

overwrite: true | false.

transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }].

Exemple :*/