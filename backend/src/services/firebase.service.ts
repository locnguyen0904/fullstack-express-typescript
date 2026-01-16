import * as admin from 'firebase-admin';
import { Service } from 'typedi';
import config from '../config/env.config';
import logger from './logger.service';

@Service()
export class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey,
          }),
        });
        logger.info('Firebase Admin initialized successfully');
      } catch (error) {
        logger.error('Firebase Admin initialization failed', error);
      }
    }
  }

  public getAuth() {
    return admin.auth();
  }
}
