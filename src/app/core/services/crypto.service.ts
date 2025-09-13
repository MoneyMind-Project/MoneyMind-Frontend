import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private secretKey = environment.SECRET_KEY;

  encrypt(data: any): string {
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, this.secretKey).toString();
  }

  decrypt<T>(encryptedData: string): T | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedJson) as T;
    } catch (e) {
      console.error('Error al desencriptar:', e);
      return null;
    }
  }
}
