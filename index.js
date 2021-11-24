#!/usr/bin/env node

const axios = require("axios").default;
const prompt = require("prompt-sync")();

const hash = process.argv.slice(2);

async function getEventUuid(hash) {
  return new Promise((resolve, reject) => {
    const config = {
      method: "get",
      url: `https://app2.sli.do/api/v0.5/events?hash=${hash}`,
      headers: { "Cache-Control": "no-cache" },
    };

    axios(config)
      .then(function (response) {
        resolve(response.data[0]["uuid"]);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

async function getAccessToken(uuid) {
  return new Promise((resolve, reject) => {
    const config = {
      method: "post",
      url: `https://app2.sli.do/api/v0.5/events/${uuid}/auth`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-cache",
      },
    };

    axios(config)
      .then(function (response) {
        resolve(response.data.access_token);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

async function getQuestions(uuid, token) {
  return new Promise((resolve, reject) => {
    var config = {
      method: "get",
      url: `https://app2.sli.do/api/v0.5/events/${uuid}/questions`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    };

    axios(config)
      .then(function (response) {
        const questions = response.data.map((question) => {
          return {
            id: question.event_question_id,
            text: question.text_formatted,
          };
        });
        resolve(questions);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

async function upvote(uuid, questionId, token) {
  return new Promise((resolve, reject) => {
    const config = {
      method: "post",
      url: `https://app2.sli.do/api/v0.5/events/${uuid}/questions/${questionId}/like`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Content-Length": 0,
      },
    };

    axios(config)
      .then(function () {
        resolve();
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

async function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * 2001) + 1500);
  });
}

async function main() {
  if (hash.length === 0 || hash.length === 1) {
    console.error(
      "Must provide hash: https://app.sli.do/event/{hash}/live/questions\nMust provide number of votes to add.\nex: node index.js abc123 10"
    );
  } else {
    const uuid = await getEventUuid(hash[0]);
    await sleep();
    const upvoteCount = hash[1];
    let token = await getAccessToken(uuid);
    await sleep();
    const questions = await getQuestions(uuid, token);
    await sleep();
    let questionIndex;
    let questionId;

    if (questions.length === 0) {
      console.error("No questions have been asked yet!");
    }

    console.log("Which question do you want to upvote?");

    for (let i = 0; i < questions.length; i++) {
      console.log(`${i + 1}. ${questions[i].text}`);
    }

    while (!questionIndex) {
      questionIndex = prompt("> ");
      questionId = questions[questionIndex - 1].id;
    }

    let count = 0;
    console.log(`Performing ${upvoteCount} upvotes."`);

    while (count < upvoteCount) {
      newToken = await getAccessToken(uuid);
      await sleep();
      await upvote(uuid, questionId, newToken).catch(() => {});
      console.clear();
      console.log(`${count + 1} upvotes completed`);
      count++;
    }
  }
}

main();
