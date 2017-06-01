var sjcl = require('./sjcl');
var Config = require('./init');

var RNCryptor = {};

/*
    Takes password string and salt WordArray
    Returns key bitArray
*/

RNCryptor.KeyForPassword = function(password, salt) {
  var hmacSHA1 = function (key) {
      var hasher = new sjcl.misc.hmac(key, sjcl.hash.sha1);
      this.encrypt = function () {
          return hasher.encrypt.apply(hasher, arguments);
      };
  };
  return sjcl.misc.pbkdf2(password, salt, 3, 32 * 8, hmacSHA1);
}

/*
  Takes password string and plaintext bitArray
  options:
    iv
    encryption_salt
    html_salt
  Returns ciphertext bitArray
*/
RNCryptor.Encrypt = function(password, plaintext, options) {
  options = options || {}
  var encryption_salt = options["encryption_salt"] || sjcl.random.randomWords(8 / 4); // FIXME: Need to seed PRNG
  var encryption_key = RNCryptor.KeyForPassword(password, encryption_salt);

  var hmac_salt = options["hmac_salt"] || sjcl.random.randomWords(8 / 4);
  var hmac_key = RNCryptor.KeyForPassword(password, hmac_salt);

  var iv = options["iv"] || sjcl.random.randomWords(16 / 4);

  var version = sjcl.codec.hex.toBits("03");
  var options = sjcl.codec.hex.toBits("01");
  
  var message = sjcl.bitArray.concat(version, options);
  message = sjcl.bitArray.concat(message, encryption_salt);
  message = sjcl.bitArray.concat(message, hmac_salt);
  message = sjcl.bitArray.concat(message, iv);

  var aes = new sjcl.cipher.aes(encryption_key);
  sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
  var encrypted = sjcl.mode.cbc.encrypt(aes, plaintext, iv);

  message = sjcl.bitArray.concat(message, encrypted);

  var hmac = new sjcl.misc.hmac(hmac_key).encrypt(message);
  message = sjcl.bitArray.concat(message, hmac);

  return message;
}

/*
  Takes password string and message (ciphertext) bitArray
  options:
    iv
    encryption_salt
    html_salt
  Returns plaintext bitArray
*/
RNCryptor.Decrypt = function(password, message, options) {
  options = options || {}

  var version = sjcl.bitArray.extract(message, 0 * 8, 8);
  var options = sjcl.bitArray.extract(message, 1 * 8, 8);

  var encryption_salt = sjcl.bitArray.bitSlice(message, 2 * 8, 10 * 8);
  var encryption_key = RNCryptor.KeyForPassword(password, encryption_salt);

  var hmac_salt = sjcl.bitArray.bitSlice(message, 10 * 8, 18 * 8);
  var hmac_key = RNCryptor.KeyForPassword(password, hmac_salt);

  var iv = sjcl.bitArray.bitSlice(message, 18 * 8, 34 * 8);

  var ciphertext_end = sjcl.bitArray.bitLength(message) - (32 * 8);

  var ciphertext = sjcl.bitArray.bitSlice(message, 34 * 8, ciphertext_end);

  var hmac = sjcl.bitArray.bitSlice(message, ciphertext_end);

  var expected_hmac = new sjcl.misc.hmac(hmac_key).encrypt(sjcl.bitArray.bitSlice(message, 0, ciphertext_end));

  // .equal is of consistent time
  if (! sjcl.bitArray.equal(hmac, expected_hmac)) {
    throw new sjcl.exception.corrupt("HMAC mismatch or bad password.");
  }

  var aes = new sjcl.cipher.aes(encryption_key);
  sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
  var decrypted = sjcl.mode.cbc.decrypt(aes, ciphertext, iv);

  return decrypted;
}


EncryptManager = {
    
    init: function(callBack){

        window.orientation = 1;
        
        var timer = setInterval(function () {
            
            if(sjcl.random.isReady()) {

                clearInterval(timer);

            }
            
        }, 100);

    },
    encryptText : function(text){
        
        if( text.length == 0)
            return '';
        
        try{
            var encryptedBin = RNCryptor.Encrypt(Config.AESPassword,
                sjcl.codec.utf8String.toBits(text)
                
            );
            
            var encryptedHex = sjcl.codec.hex.fromBits(encryptedBin);
            
            return encryptedHex;

        } catch(ex){
            console.log(ex);
        }
        
        return '';
            
    },
    decryptText : function(text){
        
        try{
            var plaintext = RNCryptor.Decrypt(Config.AESPassword,
                sjcl.codec.hex.toBits(text)
            );

            // convert hex to string
            var input = sjcl.codec.hex.fromBits(plaintext);

            // split input into groups of two
            var hex = input.match(/[\s\S]{2}/g) || [];
            var output = '';
        
            // build a hex-encoded representation of your string
            for (var i = 0, j = hex.length; i < j; i++) {
                output += '%' + ('0' + hex[i]).slice(-2);
            }
        
            // decode it using this trick
            output = decodeURIComponent(output);
            
            return output;

        } catch(ex){
            
            return text;
        }
        
        return '';
    }
}

module["exports"] = EncryptManager;