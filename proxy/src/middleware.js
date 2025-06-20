const { RequestHandler } = require("express");
const fs = require("fs");
const path = require("path");
const parser = require("http-string-parser");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: path.join(__dirname, '../logs/ids.csv'),
  header: [
    { id: 'description', title: 'description' },
    { id: 'requestUrl', title: 'requestUrl' },
    { id: 'requestBody', title: 'requestBody' },
    { id: 'ip', title: 'ip' },
    { id: 'tags', title: 'tags' },
    { id: 'score', title: 'score' },
    { id: 'rating', title: 'rating' },
  ]
});
const logger = fs.open

/**
 * @typedef {Object} IWebAttack
 * @property {number} id
 * @property {string} rule
 * @property {string} description
 * @property {string[]} tags
 * @property {number} impact
 */

/**
 * Unescapes HTML entities in a string.
 * @param {string} htmlStr - The HTML string to unescape.
 * @returns {string} The unescaped string.
 */
function unEscape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  return htmlStr;
}

const webAttacks = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./web-attacks.json"), "utf8")
).filters;

const getObjectValues = (obj) => (obj && typeof obj === 'object')
  ? Object.values(obj).map(getObjectValues).flat()
  : [obj]

/**
 * Detects common web attacks in the URL and request body.
 * @param {string} url - The URL to check for attacks.
 * @param {string} body - The request body to check for attacks.
 * @returns {IWebAttack|null} The detected web attack or null if no attack is found.
 */
const detectCommonWebAttacks = (url, body) => {
  const attack = webAttacks.find((attack) => {
    const escapedUrl = unEscape(url);
    const escapedBody = unEscape(body);

    /**
     * Checks if a regular expression match is found.
     * @param {RegExpExecArray|null} m - The regular expression match result.
     * @returns {boolean} True if a match is found, false otherwise.
     */
    const foundMatch = (m) => {
      if (m == null) {
        return false;
      }
      return m.length > 0;
    };

    try {
      const regEx = new RegExp(attack.rule, "gm");
      const bodyExec = regEx.exec(escapedBody);
      const urlExec = regEx.exec(escapedUrl);

      return foundMatch(bodyExec) || foundMatch(urlExec);
    } catch (e) {
      return false;
    }
  });

  return attack;
};

/**
 * Express middleware to detect web attacks.
 * @type {RequestHandler}
 */
const ExpressIDS = async (req, res, next) => {
  const objectValues = getObjectValues(req.body).concat(getObjectValues(req.query ?? {}))

  let detectedAttack = false
  console.log(req.query)
  for (
    objectValue of objectValues) {
    const detectedWebAttack = detectCommonWebAttacks(
      req.url,
      objectValue
    );



    console.log('hey')

    if (detectedWebAttack != null) {
      detectedAttack = true
      console.log(`Detected web attack: ${detectedWebAttack.description}`)
      const scoreNumber = parseInt(detectedWebAttack.impact)
      await csvWriter.writeRecords([{
        description: detectedWebAttack.description,
        requestUrl: req.url,
        requestBody: objectValues.join('#'),
        ip: req.ip,
        tags: detectedWebAttack.tags.join(','),
        score: detectedWebAttack.impact,
        rating: scoreNumber >= 0.1 && scoreNumber <= 3.9 ? 'Low' : scoreNumber >= 4 && scoreNumber <= 6.9 ? 'Medium' : scoreNumber >= 7 && scoreNumber <= 8.9 ? 'High' : 'Critical'
      }])
    }
  }
  if (detectedAttack)
    return res.status(403).send('Forbidden')
  next();
};

module.exports = ExpressIDS;

