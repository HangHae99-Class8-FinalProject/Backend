const express = require("express");
require("dotenv").config;
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const { sequelize } = require("./models");
const rotuer = require("./routes");
const port = 3000;
const passportConfig = require("./passport");

const logger = require("./winston");
const morgan = require("morgan");
//미리 정의된 이름의 문자열
const combined =
  ":method :url :status :response-time ms - :res[content-length]"; //:status 성공, 오류, 클라이언트 오류, 리다이렉션, 정보
const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : combined; // morgan의 출력 형태 .env에서 NODE_ENV 설정 production : 배포환경 dev : 개발환경
console.log(morganFormat); //dev인지 production인지 확인
const scheduleData1 = {
  dayOfweek: [0, 1, 2, 3, 4, 5, 6],
  hour: 0,
  minute: 0,
};
const scheduleData2 = {
  dayOfweek: [1],
  hour: 0,
  minute: 0,
};
const schdule = require("./node-scheduler");
schdule.set1(scheduleData1);
schdule.set2(scheduleData2);
const mailer = require("./node-mailer");
const emailService = new mailer();
class BadRequestError extends Error {}
const app = express();
passportConfig(passport, app);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });


app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.xssFilter());

app.use(
  cors({
    credentials: true,

    origin: [
      "http://localhost:3000",
      "https://weeklyrun.com",
      "https://yunseong.shop",
    ],
  })
);

app.use(morgan(morganFormat, { stream: logger.stream })); // morgan 로그 설정
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // body로 들어오는 json 형태의 데이터를 파싱해준다.
app.use("/api", rotuer);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use((err, req, res, next) => {
  emailService.errorAlertSend(err.message);
  if (BadRequestError) {
    res.status(400);
    res.json({
      statusCode: err.statusCode,
      result: false,
      message: err.message,
    });
  } else {
    res.json(`Status Code : ${err.statusCode}, Error Type : ${err.type}`);
  }
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
module.exports = app;
