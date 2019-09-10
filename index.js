const fs = require("fs");
const axios = require("axios");
const convert = require("xml-js");


// SITEMAP CONFIG
const domain = "";
const xmlOptions = { compact: true, spaces: 4 };

const CHANGE_DATE_INDEX = "2019-09-12";
const CHANGE_DATE_TOP_LEVEL = "2019-09-05";
const CHANGE_DATE_TOPICS = CHANGE_DATE_TOP_LEVEL;
const CHANGE_DATE_QUESTIONS = false;

const PRIORITY_TOP_LEVEL = "0.8";
const PRIORITY_TOPIC = "0.6";
const PRIORITY_QUESTION = "0.4";

const CHANGE_FREQ_TOP_LEVEL = "daily";
const CHANGE_FREQ_TOPIC = "monthly";
const CHANGE_FREQ_QUESTION = "weekly";

const topLevelUrls = [
  { loc: "/", priority: "1.0", mod: CHANGE_DATE_INDEX },
  {
    loc: "/business",
    priority: PRIORITY_TOP_LEVEL,
    mod: CHANGE_DATE_TOP_LEVEL
  },
  {
    loc: "/contact-us",
    priority: PRIORITY_TOP_LEVEL,
    mod: CHANGE_DATE_TOP_LEVEL
  },
  { loc: "/faq", priority: PRIORITY_TOP_LEVEL, mod: CHANGE_DATE_TOP_LEVEL }
];

const varTopic = "topic";
const varQuestion = "question";

const faqEndPoint = "/faq";
const faqDataLocation = "/faq-articles";

// Fetches FAQ article data off live server
const getArticles = () => {
  axios
    .get(`${domain}${faqDataLocation}`)
    .then(response => {
      // console.log(response.data);
      buildSitemap(response.data.filter(el => el != null));
    })
    .catch(error => {
      console.error(error);
    });
};

// Computes today's date and returns it in required date format
const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
};

// Loops FAQ and constructs sitemap data based on config
const buildSitemap = topics => {
  const faqUrls = [];
  const questionModDate = CHANGE_DATE_QUESTIONS
    ? CHANGE_DATE_QUESTIONS
    : getTodayDate();

  topLevelUrls.forEach(url => {
    faqUrls.push({
      loc: `${domain}${url.loc}`,
      changefreq: CHANGE_FREQ_TOP_LEVEL,
      lastmod: url.mod,
      priority: url.priority
    });
  });

  topics.forEach(topic => {
    faqUrls.push({
      loc: `${domain}${faqEndPoint}?${varTopic}=${topic.id}`,
      changefreq: CHANGE_FREQ_TOPIC,
      lastmod: CHANGE_DATE_TOPICS,
      priority: PRIORITY_TOPIC
    });
    topic.articles.forEach(article => {
      faqUrls.push({
        loc: `${domain}${faqEndPoint}?${varTopic}=${topic.id}&amp;${varQuestion}=${article.id}`,
        changefreq: CHANGE_FREQ_QUESTION,
        lastmod: questionModDate,
        priority: PRIORITY_QUESTION
      });
    });
  });

  const sitemap = {
    _declaration: {
      _attributes: {
        version: "1.0",
        encoding: "utf-8"
      }
    },
    urlset: {
      _attributes: {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9"
      },
      url: faqUrls
    }
  };

  exportSitemap(sitemap);
};

// Converts JSON to XML and saves file
const exportSitemap = (sitemap, fileName = "sitemap.xml") => {
  const xmlData = convert.json2xml(sitemap, xmlOptions);
  fs.writeFile(fileName, xmlData, err => {
    console.log(err ? err : "Sitemap was saved!");
  });
};

getArticles();
