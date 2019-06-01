/* Key formation here*/

var orderofpressing = "";
var Round_keys = [];
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
function shift_left_1(shift_txt) {
    var newStr = "";
    for (var i = 0; i < 27; i++) {
        newStr = newStr + shift_txt[i + 1];
    }
    newStr = newStr + shift_txt[0];
    return newStr;
}

function key_per_round(round_no) {
    var shift_counter = Round[round_no - 1];
    for (var i = 0; i < shift_counter; i++) {
        key_parts[0] = shift_left_1(key_parts[0]);
        key_parts[1] = shift_left_1(key_parts[1]);
    }
    console.log("Shift->" + shift_counter + " for round->>" + round_no);
    console.log("After shifting Part-1->>" + key_parts[0]);
    console.log("After shifting Part-2->>" + key_parts[1]);
    //here each parts have their bits left shifted according to round number
    //now the pc-2 for generation of key
    var round_key = key_PC_2();
    Round_keys.push(round_key);
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

    for (var i = 0; i < 16; i++) {
        key_per_round(i + 1);
    }
}







/*Functions for text modification*/
function remove_spaces(text) {
    var i;
    var outstr = "";

    for (i = 0; i < text.length; i++)
        if (text.charAt(i) != " ")
            // not a space, include it
            outstr = outstr + text.charAt(i);

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
    var newstr = "";
    for (i = 0; i < a.length; i++)
        if (a[i] == b[i]) {
            newstr = newstr + "0";
        } else {
            newstr = newstr + "1";
        }
    return newstr;
}

function text_Round_Encrypt(roundNo) {
    var roundKey = Round_keys[roundNo - 1];
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
    console.log("Text for E prem->>" + text);
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
    console.log("A used for XOR->>" + textPart);
    console.log("B used for XOR->>" + roundKey);
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








function var_init() {

    key_parts = []; //storing left and right sub parts
    text_parts = [];//storing left and right sub parts
}

function Encrypt(key, text) {
    var_init();
    key_init(key);
    text_init(text);

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

    var output_txt = (cipherText.slice(0, 8) + " " + cipherText.slice(8, 16) + " " + cipherText.slice(16, 24) + " " + cipherText.slice(24, 32) + " " + cipherText.slice(32, 40) + " " + cipherText.slice(40, 48) + " " + cipherText.slice(48, 56) + " " + cipherText.slice(56, 64));
    document.getElementById("output").value = output_txt;
    return cipherText;
}
function Decrypt(key, text) {
    console.log("***********************************************************************************");
    var_init();
    key_init(key);
    text_init(text);

    //now performing 32 bit swap
    var temp = text_parts[0];
    text_parts[0] = text_parts[1];
    text_parts[1] = temp;

    for (var i = 16; i > 0; i--) {
        console.log("***********************************************************************************");
        text_Round_Decrypt(i);
    }

    var initial_text = FP_text();
    console.log("Initial text length->>" + initial_text.length);
    var output_txt = (initial_text.slice(0, 8) + " " + initial_text.slice(8, 16) + " " + initial_text.slice(16, 24) + " " + initial_text.slice(24, 32) + " " + initial_text.slice(32, 40) + " " + initial_text.slice(40, 48) + " " + initial_text.slice(48, 56) + " " + initial_text.slice(56, 64));
    document.getElementById("output").value = output_txt;
    return initial_text;
}

function text_Round_Decrypt(roundNo) {
    var roundKey = Round_keys[roundNo - 1];
    console.log("Round-key->>" + roundKey);
    var fResult = DES_F_Function(text_parts[0], roundKey);
    console.log("DES output->>" + fResult);
    var xorResult = XOR_F(fResult, text_parts[1]);

    text_parts[1] = text_parts[0];    //L1 = R0
    text_parts[0] = xorResult;  //R1=f(R0,k0) + L0
}


/*****************************************************Triple DES function**************************************************************************/
function checkAnswer() {
    if (orderofpressing == "EDE") {
        TripleDES_Encrypt();
        orderofpressing = "";
    }
    else if (orderofpressing == "DED") {
        TripleDES_Decrypt();
        orderofpressing = "";
    } else {
        document.getElementById("status").value = "Procedural->>Wrong Answer!";
        orderofpressing = "";
    }

}
function TripleDES_Encrypt() {
    var ans = document.getElementById("answer").value;
    ans = remove_spaces(ans);
    var text = document.getElementById("plain_text").value;
    var key1 = document.getElementById("key_A").value;
    var key2 = document.getElementById("key_B").value;

    var encryptedText1 = Encrypt(key1, text);
    var decryptedText = Decrypt(key2, encryptedText1);
    var encryptedText2 = Encrypt(key1, decryptedText);

    if (ans == encryptedText2) {
        document.getElementById("status").value = "Encryption ->>Correct Answer!";
    } else {
        document.getElementById("status").value = "Encryption ->>Wrong Answer!";
    }
}
function TripleDES_Decrypt() {
    var ans = document.getElementById("answer").value;
    ans = remove_spaces(ans);
    var text = document.getElementById("plain_text").value;
    var key1 = document.getElementById("key_A").value;
    var key2 = document.getElementById("key_B").value;

    var decryptedText1 = Decrypt(key1, text);
    var encryptedText = Encrypt(key2, decryptedText1);
    var decryptedText2 = Decrypt(key1, encryptedText);

    if (ans == decryptedText2) {
        document.getElementById("status").value = "Decryption ->>Correct Answer!";
    } else {
        document.getElementById("status").value = "Decryption ->>Wrong Answer!";
    }
}
function DES_Encrypt() {
    var text = document.getElementById("text").value;
    var key = document.getElementById("key").value;
    text = remove_spaces(text);
    key = remove_spaces(key);
    if (text.length !== 64 | key.length !== 16) {
        alert("64 bit plain text (binary) and 16 bit hex is required ");
    }
    else if (Validite(text)!==1) {
        alert("64 bit plain text (binary) is required ");
    }
    else {
        var encryptedText = Encrypt(key, text);
        orderofpressing = orderofpressing + "E";
    }

}
function DES_Decrypt() {
    var text = document.getElementById("text").value;
    var key = document.getElementById("key").value;
    text = remove_spaces(text);
    key = remove_spaces(key);
    if (text.length !== 64 | key.length !== 16) {
        alert("64 bit plain text (binary) and 16 bit hex is required ");
    }
    else if (Validite(text)!==1) {
        alert("64 bit plain text (binary) is required ");
    }
    else {
        var decryptedText = Decrypt(key, text);
        orderofpressing = orderofpressing + "D";
    }

}

function changePlainText() {
    var txt = document.getElementById("plain_text");
    var randtxt = Math.floor((Math.random() * 18446744073709551615) + 10000000000000000000);

    var temp = parseInt(randtxt, 10).toString(2);
    temp = (temp.slice(0, 8) + " " + temp.slice(8, 16) + " " + temp.slice(16, 24) + " " + temp.slice(24, 32) + " " + temp.slice(32, 40) + " " + temp.slice(40, 48) + " " + temp.slice(48, 56) + " " + temp.slice(56, 64));

    txt.value = temp;
}
function changeKeyA() {
    var keyA = document.getElementById("key_A");

    var randtxt = Math.floor((Math.random() * 1844674407370955161) + 1000000000000000000);

    var temp = parseInt(randtxt, 10).toString(16);
    keyA.value = temp;
}
function changeKeyB() {
    var keyB = document.getElementById("key_B");
    var randtxt = Math.floor((Math.random() * 1844674407370955161) + 1000000000000000000);

    var temp = parseInt(randtxt, 10).toString(16);
    keyB.value = temp;
}
function Validite(txt){
    var state=0;
    var i;
    for( i=0;i<txt.length;i++){
        state=0;
        if(txt[i]=="0" | txt[i]=="1"){
            state=1;
        }
    }
    if(i!==64){
        state=0;
    }
    return state;
}