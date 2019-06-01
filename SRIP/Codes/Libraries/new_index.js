/* Key formation here*/

var RoundKey = [];    //for storing keys for each rund to take use in decrypt function
var key_parts = []; //storing left and right sub parts
var text_parts = [];//storing left and right sub parts
var cipherText; //storing cipher comes after encrypt function

function form_64_bit_binary_key(key) {
    //here converting the hex value to 64 bit binary value
    var result = "";
    for (var i = 0; i < key.length; i++) {
        var str = key[i];
        var temp = parseInt(str, 16).toString(2);
        if (temp.length < 4) {
            var appendZero = 4 - temp.length;
            for (var k = 0; k < appendZero; k++) {
                temp = "0" + temp;
            }
        }
        result = result + temp;
    }
    //here the bits that are used for padding ae removed (8,16,24,32,40,48,56,64)
    //these bits are used for checking purposes and is ignored while encytpion.
    //hence our effective key size is 56 bit
    return result;
}

//this method is doing transposition using PC-1 during intilaization of key
function key_PC_1(key) {
    var newkey = "";
    var key_part_1 = "";
    var key_part_2 = "";

    for (var i = 0; i < PC_1_perm.length; i++) {
        newkey = newkey + key[PC_1_perm[i] - 1];
    }
    //new key is 56 bit
    console.log("56 bit key is->>" + newkey);
    key_part_1 = newkey.slice(0, 28);    //0-27
    key_part_2 = newkey.slice(28);  //27-last
    key_parts.push(key_part_1);
    key_parts.push(key_part_2);
    return key_parts;
}
function key_PC_2() {
    var round_key = "";
    var newkey = key_parts[0] + key_parts[1];
    console.log("Key for generating round_key->>" + newkey);

    for (var i = 0; i < PC_2_perm.length; i++) {
        round_key = round_key + newkey[PC_2_perm[i] - 1];
    }
    //this is a 48 bit key
    return round_key;
}
function shift_left_1(CD) {
    var newStr = "";
    for (var i = 0; i < 27; i++) {
        newStr = newStr + CD[i + 1];
    }
    newStr = newStr + CD[0];
    return newStr;
}

function key_per_round(round_no) {
    var shift_counter = Round[round_no - 1];
    for (var i = 0; i < shift_counter; i++) {
        key_parts[0] = shift_left_1(key_parts[0]);
        key_parts[1] = shift_left_1(key_parts[1]);
    }
    console.log("After shifting Part-1->>" + key_parts[0]);
    console.log("After shifting Part-2->>" + key_parts[1]);
    //here each parts have their bits left shifted according to round number
    //now the pc-2 for generation of key
    var round_key = key_PC_2();
    RoundKey.push(round_key);
    return round_key;
}
function key_init(key) {
    //here key is 64 bit
    key = form_64_bit_binary_key(key);
    console.log("Fecthed key->>" + key);
    //here key is 56 bit ,both part contain 28 bit each
    key_parts = key_PC_1(key);
    console.log("Now the key is of 56 bit and is divided into two parts");
    console.log("Before shifting Part-1->>" + key_parts[0]);
    console.log("Before shifting Part-2->>" + key_parts[1]);
}







/*Functions for text modification*/
function remove_spaces(text) {
    var i;
    var outstr = "";

    for (i = 0; i < text.length; i++)
        if (text.charAt(i) != " ")
            // not a space, include it
            outstr = outstr+text.charAt(i);

    return outstr;
}
function IP_text(text) {
    var newtext = "";
    var text_part_1 = "";
    var text_part_2 = "";
    console.log("text for IP->>" + text);
    console.log("Length of text->" + text.length + " text->>" + text[63]);
    for (var i = 0; i < IP.length; i++) {
        newtext = newtext + text[IP[i] - 1];
    }
    //new text is again 64 bit but with diffrent order of bits
    console.log("64 bit text after IP is->>" + newtext);
    text_part_1 = newtext.slice(0, 32);    //0-31
    text_part_2 = newtext.slice(32);  //32-last
    text_parts.push(text_part_1);
    text_parts.push(text_part_2);
    return text_parts;
}

function text_init(text) {
    console.log("text for init->>" + text);
    text = remove_spaces(text);
    console.log("text after spaces->>" + text);
    text_parts = IP_text(text);
    console.log("Part-1->>" + text_parts[0]);
    console.log("Part-2->>" + text_parts[1]);
}

function XOR_F(a, b) {
    //both a and b are 48 bits
    var i;
    for (i = 0; i < a.length; i++)
        a[i] = a[i] ^ b[i];
    return a;
}

function text_Round_Encrypt(roundNo) {
    var roundKey = key_per_round(roundNo);
    console.log("Round-key->>" + roundKey);
    var fResult = DES_F_Function(text_parts[1], roundKey);
    console.log("DES output->>" + fResult);
    var xorResult = XOR_F(fResult, text_parts[0]);


    text_parts[0] = text_parts[1];    //L1 = R0
    text_parts[1] = xorResult;  //R1=f(R0,k0) + L0

}
function FP_text() {
    var text = text_parts[0] + text_parts[1];
    var newtext = "";

    for (var i = 0; i < FP.length; i++) {
        newtext = newtext + text[FP[i] - 1];
    }
    //new text is again 64 bit but with diffrent order of bits
    console.log("64 bit text after IP is->>" + newtext);
    return newtext;
}








/*Now the function for rounds in DES*/

function E_prem_text(text) {
    //here text is 32 bit
    var newtext = "";
    for (var i = 0; i < E_perm.length; i++) {
        newtext = newtext + text[E_perm[i] - 1];
    }
    //here new text is now 48 bit
    return newtext;
}
function P_perm_DES_fucntion(text) {
    var newtext = "";
    for (var i = 0; i < P_perm.length; i++) {
        newtext = newtext + text[P_perm[i] - 1];
    }
    //here new text is agan 32 bit
    return newtext;
}

function calucate_SBox(textArray) {
    var newtext = "";
    //the array contain 8 blocks of 6 bit each

    for (var i = 0; i < 8; i++) {
        var text = textArray[i];
        var row = text[0] + text[5];
        var col = text.slice(1, 5);
        row = parseInt(row, 2).toString(10);
        col = parseInt(col, 2).toString(10);
        row = parseInt(row);
        col = parseInt(col);
        row = row * 8 + col;
        var SRes = "";
        if (i === 0) {
            SRes = S1[row].toString();
        }
        else if (i === 1) {
            SRes = S2[row].toString();
        }
        else if (i === 2) {
            SRes = S3[row].toString();
        }
        else if (i === 3) {
            SRes = S4[row].toString();
        }
        else if (i === 4) {
            SRes = S5[row].toString();
        }
        else if (i === 5) {
            SRes = S6[row].toString();
        }
        else if (i === 6) {
            SRes = S7[row].toString();
        }
        else if (i === 7) {
            SRes = S8[row].toString();
        }
        //console.log("Dec Sres->>"+SRes);
        SRes = parseInt(SRes, 10).toString(2);
        if (SRes.length < 4) {
            var appendZero = 4 - SRes.length;
            for (var k = 0; k < appendZero; k++) {
                SRes = "0" + SRes;
            }
        }
        newtext = newtext + SRes;
        // console.log("Sres->>"+SRes+"  Newtext->>"+newtext);
    }
    return newtext;
}

function DES_F_Function(textPart, roundKey) {
    //here the textpart is 32 bit and roundkey is 48 bit
    textPart = E_prem_text(textPart);
    console.log("text after E permutation->>" + textPart);
    //here the textpart is now 48 bit
    var xorResult = XOR_F(textPart, roundKey);
    console.log("text after xor permutation->>" + xorResult);
    //here the result is divided into 8 blocks of 6bits each for caluculation through Sbox
    var SBoxArray = [];
    for (var i = 0; i < xorResult.length;) {
        var temp = xorResult.slice(i, i + 6);
        i = i + 6;
        SBoxArray.push(temp);
    }
    var Sboxresult = calucate_SBox(SBoxArray);
    console.log("text after Sboxresult->>" + Sboxresult);
    //here the Sbox result is 32 bit again
    var newtext = P_perm_DES_fucntion(Sboxresult);
    return newtext;
}










function Encrypt() {
    key_init("3b3898371520f75e");
    text_init("00010100 11010111 01001001 00010010 01111100 10011110 00011011 10000010");

    for (var i = 0; i < 16; i++) {
        console.log("***********************************************************************************");
        text_Round_Encrypt(i + 1);
    }
    //now performing 32 bit swap
    var temp = text_parts[0];
    text_parts[0] = text_parts[1];
    text_parts[1] = temp;

    cipherText = FP_text();
    console.log("Cipher text length->>" + cipherText.length + "\n Cipher->>" + cipherText);

}
function Decrypt() {
    console.log("***********************************************************************************");
    console.log("***********************************************************************************");
    console.log("***********************************************************************************");

    text_parts = [];
    text_parts = IP_text(cipherText);

    //now performing 32 bit swap
    var temp = text_parts[0];
    text_parts[0] = text_parts[1];
    text_parts[1] = temp;



    for (var i = 15; i >= 0; i--) {
        console.log("***********************************************************************************");
        text_Round_Decrypt(i);
    }


    var initial_text = FP_text();
    console.log("Initial text length->>" + initial_text.length + "\n Initial->>" + initial_text);
    console.log("00010100 11010111 01001001 00010010 01111100 10011110 00011011 10000010");
}

function text_Round_Decrypt(roundNo) {
    var roundKey = RoundKey[roundNo];
    console.log("Round-key->>" + roundKey);
    var fResult = DES_F_Function(text_parts[0], roundKey);
    console.log("DES output->>" + fResult);
    var xorResult = XOR_F(fResult, text_parts[1]);

    text_parts[1] = text_parts[0];    //L1 = R0
    text_parts[0] = xorResult;  //R1=f(R0,k0) + L0
}