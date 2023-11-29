import JSEncrypt from "jsencrypt/bin/jsencrypt.min";

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey =
  "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCl+0nngH1VamrFnqisB0OgJpipH/4mMvbIcl+cBZpzOGAKUXqUzLoX0ZZck5OP4BZFvy2Gs/cImQwKrSagP5Zy+IGEzQk3oPym4Tq5TSvmGX+DWGf5JalPm0oBPwYNfMsEk0ymUTp3UB/IV1j0vHXiq3QOduO93LwRfYi0qqRw1wIDAQAB";

const privateKey =
  "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKX7SeeAfVVqasWeqKwHQ6AmmKkf/iYy9shyX5wFmnM4YApRepTMuhfRllyTk4/gFkW/LYaz9wiZDAqtJqA/lnL4gYTNCTeg/KbhOrlNK+YZf4NYZ/klqU+bSgE/Bg18ywSTTKZROndQH8hXWPS8deKrdA52473cvBF9iLSqpHDXAgMBAAECgYAkxiABon4iRomRby1/r7xT5zk7f1MXs4Lpti1oq/UkQgFFR/gYr6MrU8w0hp3S6psEqO61QXoh9Yatdt9v8aarRtCH8+XaafZBCS1LADNp/E366wIUvJDbgyz9Tdo701sRD3xeA4AlZ6O10UlRFD82+6j2W4QJyq+MpytCOnRbAQJBANskadM7s5TWDTdPo5QvHp+fQC08sHYlcFnwx2AIiDXj6lkk30y/eKKPr3/kb6wg8ibwJWgek85a96pK4k1kL/ECQQDB5fFJ9MGwLS01cW3Hryo2vQOuHQruUslSaAcLSYPos/cz2ocgKHdq+BfoQUcv6818wjeu0Osr+bmnYKK7EnVHAkAqvmSB1iBGBKZZRohii/pOKjLLYA4PTWgnsuZAnglrcYQxVRbVEnfGRX521KjPizGQVMEHGQe9dVLffXG8pLERAkABFrl0INu1kYtfcXOcW29xPz52C9Oz4uMeg1cGyTLka55HvEJl+9Qv1ZTMyRENQ9WzjaOiZ6nqZUyVlAVV55ShAkEAxjYqP1HS/rRPuj5DTJL2tWCFsG8+HQM1O5+4NQpRUuaoIQA6RDpgRsXmPvWStqGDj1aAlKAqL2S6HH6i2O7yTQ==";

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey); // 设置公钥
  return encryptor.encrypt(txt); // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateKey); // 设置私钥
  return encryptor.decrypt(txt); // 对数据进行解密
}
