const express = require("express");
const jwtDecode = require("jwt-decode");
const wordsRouter = express.Router();
const User = require("../models/User");
const Word = require("../models/Word");

wordsRouter.get("/:voc", async (req, res) => {
  const arrayUserWordsIds = [];
  const voc = req.params.voc;
  const token = {
    uid: "6KZ0EWDaWcWhO5w5aPMKGKFbg3z2",
    displayName: null,
    photoURL: null,
    email: "devmath@yandex.com",
    emailVerified: false,
    phoneNumber: null,
    isAnonymous: false,
    tenantId: null,
    providerData: [
      {
        uid: "devmath@yandex.com",
        displayName: null,
        photoURL: null,
        email: "devmath@yandex.com",
        phoneNumber: null,
        providerId: "password",
      },
    ],
    apiKey: "AIzaSyDCMN4GLYnzx1awTI5zqT-WicIVra8X-Hw",
    appName: "[DEFAULT]",
    authDomain: "wordbox-69dec.firebaseapp.com",
    stsTokenManager: {
      apiKey: "AIzaSyDCMN4GLYnzx1awTI5zqT-WicIVra8X-Hw",
      refreshToken:
        "AOvuKvTyCVRxqakgQU6qgChkZquO5ZdNmE5zStuSmuT2HFtPEaqlSXUrGzFD8YMtaAC5QGxiXvDy8UrEJiwQL4mJiLBYwFIWqDtw3H-tQZ76m6wVHlfnJYnZGtKE_ONpczOpNODK9akRbmYtiR93LD9qTDoyoWY60ZcAIzaEtPch0bazD-iRBI2kxEWOLXApmBKOoRhe8F3mDR9KoAYigF6YtIQOwIuzsw",
      accessToken:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjljZTVlNmY1MzBiNDkwMTFiYjg0YzhmYWExZWM1NGM1MTc1N2I2NTgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd29yZGJveC02OWRlYyIsImF1ZCI6IndvcmRib3gtNjlkZWMiLCJhdXRoX3RpbWUiOjE2MTIyMTczMTYsInVzZXJfaWQiOiI2S1owRVdEYVdjV2hPNXc1YVBNS0dLRmJnM3oyIiwic3ViIjoiNktaMEVXRGFXY1doTzV3NWFQTUtHS0ZiZzN6MiIsImlhdCI6MTYxMjIxNzMxNiwiZXhwIjoxNjEyMjIwOTE2LCJlbWFpbCI6ImRldm1hdGhAeWFuZGV4LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJkZXZtYXRoQHlhbmRleC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.q0LATm9cLX-P_j_Y7G7K2ncKCxlu70Otp6mfC71QlbGfamLFvyyYhKVfMFoFeQXKoIMIWQN69vrew82kmxIH2pJ6q5cNCYcc_8t2PxRyIx0rwjOfMLs8BzdDSEnuPmxW6gHZuEWma3fgbZz-7Pl06-jWswd_nevNbhifK_394245jOZ4eZ98RB1zs3kOeKnsabVaww0Gz-ikIHoXpP3KEoNnV6gEKqtWecOy0_cbNlvBheAl0DoMtydUsF-INCQODaCQ4-K9S41f2CGOrLaUNiocJ10MIb4383OZSTlE3u9DdBUYFbL52Z8kLbBHtUP0bUSmPiL52XNFWkDAIw2EFQ",
      expirationTime: 1612220916000,
    },
    redirectEventId: null,
    lastLoginAt: "1612217316441",
    createdAt: "1606896636196",
    multiFactor: { enrolledFactors: [] },
  };

  if (token != null) {
    const decoded = jwtDecode(token.stsTokenManager.accessToken);

    const user = await User.find({ email: decoded.email });

    user[0].userwords.map((w) => {
      return arrayUserWordsIds.push(w.wordId);
    });

    // gets the word from userwords which includes voc
    const wrd = await Word.find({
      _id: arrayUserWordsIds,
      word: { $regex: voc },
    });
    console.log(wrd);
    res.send(wrd);
    return wrd;
  }
  return null;
});

module.exports = wordsRouter;
