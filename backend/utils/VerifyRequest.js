const { verify } = require("jsonwebtoken");

/**
 * Verify a Request from Cookies
 * 
 * @param {Request.header.cookie} reqCookies 
 * @param {string} tokenName The name of the cookie to be checked.
 * @param {string} signatureString The signature string being used
 * 
 * @returns {object} The verified Object
 */
const verifyRequest = (reqCookies, tokenName, signatureString) => {
    const noAuthTokenErr = new Error("Not authorized");
    noAuthTokenErr.code = 9090;

    if (!reqCookies) throw noAuthTokenErr;

    const ecellAuthCookie = reqCookies.split(";").filter((str) => str.trim().startsWith(tokenName))[0];

    if (!ecellAuthCookie) throw noAuthTokenErr;

    const token = ecellAuthCookie.split("=")[1];
    const payload = verify(token, signatureString);

    return payload;
};

module.exports = verifyRequest;