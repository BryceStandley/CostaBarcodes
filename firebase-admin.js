var admin = require("firebase-admin");

var serviceAccount = require("costabarcode-bookings-firebase-adminsdk.json");

console.log(serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
