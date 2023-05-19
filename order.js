const express = require("express");  // 一個 Node.js 應用程式框架，用於建立 Web 應用程式和 API
const app = express();
const cors = require("cors");  // 用於解決跨域資源共享問題的中介軟體
const http = require("http");  // Node.js 內建的 HTTP 模組，用於建立 Web 伺服器
const ejs = require("ejs");  // 一個 JavaScript 模板引擎，用於生成 HTML 模板
const querystring = require("querystring");  // 用於解析和格式化查詢字串的 Node.js 內建模組
const path = require("path");  // 用於處理和轉換檔案路徑的 Node.js 內建模組
const bodyParser = require("body-parser")  // 解析 HTTP 請求正文的中介軟體
const chalk = require('chalk');  // 用於在終端機上添加顏色和樣式的庫
const debug = require("debug")("order");

const hostname = "27.105.101.246";

const port = 8080;
let userCount = 0;

// Add the route handler for serving submit_order.html file

app.use(express.static(__dirname));  // 設定靜態檔案目錄，使得這個目錄下的檔案可以被直接請求，而不需要通過路由。這個中介軟體通常用於提供靜態資源，如圖片、CSS、JavaScript 檔案等。
app.set("view engine", "ejs");

app.use(cors());  // 設定跨域資源共享中介軟體，用於解決網頁中 Ajax 請求跨域問題。這個中介軟體會添加 HTTP 響應頭，告訴瀏覽器允許跨域請求

app.use(express.urlencoded({ extended: true }));//當客戶端向 /submit 路徑發送 POST 請求時，伺服器會使用 express.urlencoded 和 express.json 
app.use(express.json());//中間件來解析請求正文中的資料，然後將解析後的資料存儲在 req.body 中。在 app.post 路由處理函式中，我們可以從 req.body 中讀取這些資料，並執行相應的處理。

app.use(bodyParser.urlencoded({ extended: false }))  //解析表單資料，將表單中的資料解析為一個 JavaScript 物件。其中extended: false的設定表示使用簡單的鍵值對。
app.use(bodyParser.json())  // 解析 JSON 格式的資料，也會將資料解析成一個 JavaScript 物件。這樣從 HTTP 請求中獲取這些資料時，就能方便地使用。

app.set("port", process.env.PORT || 8080);

app.get("/", function (req, res) {
  // 抓取時間
  let now = new Date();
  month = (now.getMonth() + 1);
  hour = now.getHours();
  minute = now.getMinutes() + hour * 60;
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let dateStr;
  if (minute > 750) {
    dateStr = `${tomorrow.getMonth() + 1}/${tomorrow.getDate()}`;
  } else {
    dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
  }
  res.render("order", { userCount, dateStr });  // 進入網頁傳送變數 "userCount、dateStr"
});


app.post("/submit_order", (req, res) => {

  userCount++;  // 領餐序號+1

  const orders = req.body.orders;  // 獲取餐點內容
  const orderTime = req.body.ordertime;  // 獲取取餐時間
  const classNumber = req.body.classNumber; //獲取班級座號
  const studentID = req.body.studentID;  //獲取學號
  let totalPrice = 0;

  orders.forEach((order) => {
    totalPrice += order.qty * order.price;
  });

  const query = { orders: JSON.stringify(orders), totalPrice, orderTime, userCount, classNumber, studentID };  // 建立包和所有變數的變數
  const url = `/submit_order?${new URLSearchParams(query)}`;  // 轉送的網址


  res.json({ url });  // 傳送變數 "URL" 至網頁
  // console.log('\napp.post /submit_order ：\n');
  // console.log("userCount： ", userCount);
  // console.log("req.body： ", req.body);
  // console.log("Query： ", query);
  console.log(chalk.yellow("\napp.post /submit_order ：\n"));
  console.log(chalk.magenta("userCount： ") + JSON.stringify(userCount));
  console.log(chalk.magenta("req.body： ") + JSON.stringify(req.body));
  console.log(chalk.magenta("Query： ") + JSON.stringify(query));

});

// 進入轉送的網址(網址+URL)
app.get("/submit_order", function (req, res) {
  const orders = JSON.parse(req.query.orders);  // 獲取訂單變數
  const totalPrice = Number(req.query.totalPrice);  // 獲取總價變數
  const orderTime = req.query.orderTime;  // 獲取取餐時間變數
  const classNumber = req.query.classNumber;  // 獲取班級座號
  const studentID = req.query.studentID;  // 獲取學號
  res.render("submit_order", { orders, totalPrice, userCount, orderTime, classNumber, studentID }); //傳送變數資料至轉送的網址(網址+URL)
  //   console.log('\napp.get /submit_order ：\n');
  //   console.log("req.query.orders：",req.query.orders);
  //   console.log("req.query.totalPrice： ",req.query.totalPrice);
  //   console.log("req.query.orderTime： ",req.query.orderTime);
  console.log(chalk.yellow("\napp.get /submit_order ：\n"));
  console.log(chalk.magenta("req.query.orders： ") + JSON.stringify(req.query.orders));
  console.log(chalk.magenta("req.query.totalPrice： ") + JSON.stringify(req.query.totalPrice));
  console.log(chalk.magenta("req.query.orderTime： ") + JSON.stringify(req.query.orderTime));
  console.log(chalk.magenta("req.query.classNumber： ") + JSON.stringify(req.query.classNumber));
  console.log(chalk.magenta("req.query.studentID： ") + JSON.stringify(req.query.studentID));
});

const server = app.listen(port, () => {
  // console.log(`Server running at http://localhost:${port}/`);
  console.log(`Server running at ${chalk.blue(`http://localhost:${port}/`)}`);
});

// 處理 Ctrl + c 關閉伺服器
process.on("SIGINT", () => {
  console.log("");
  // 開始顯示動畫
  let dots = "";
  const interval = setInterval(() => {
    dots = dots.length < 3 ? dots + "." : "";
    process.stdout.write(`\rServer closing${dots}\x1b[K`);
    process.stdout.write(chalk.blue(`\rServer closing${dots}\x1b[K`));
  }, 500);

  // 關閉伺服器
  server.close(() => {
    console.log(chalk.red("\nserver closed"));

    // 清除動畫
    clearInterval(interval);
    process.exit(0);
  });
});

// 關閉時清除動畫
process.on("exit", () => {
  process.stdout.write("\n");
});