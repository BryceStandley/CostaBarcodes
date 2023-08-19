var admin = require("firebase-admin");

var serviceAccount = require("costabarcode-bookings-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
