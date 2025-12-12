import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)  //peut etre sans arguement si on veut capturer tout les types d'erreurs pas seulement http
export class HttpExceptionFilter implements ExceptionFilter {
    //on a implementé depuis l'interface exception filter donc on doit utiliser catch avec les deux params
  //exception c'est l'erreur intercepté, ici http psq on veut capturer celle de http(déja declaré dans le @c)
  //host de type argumentHost pour accéder au contexte d'execution et avoir request et response
  catch(exception: HttpException, host: ArgumentsHost) 
  
  {
     //ctx c un wrapper qui permet de convertir contexte generique en http
    const ctx = host.switchToHttp();
     //response d'Express pour acceder au response et envoyer une response personalisé
    const response = ctx.getResponse<Response>();
    //Utile pour extraire des infos sur la requête (URL, headers, méthode, body, paramètres, etc.). Ici on utilisera request.url
    const request = ctx.getRequest<Request>();
    //stocker code de sstatus retourné par httpException
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
  let message = (exceptionResponse as any ).message || exception.message;
    //response http personalisé 
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url, //url demandé
        message
      });
  }
}
