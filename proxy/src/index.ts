import express from "express";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const csvFilePath = path.join(__dirname, "../logs/ids.csv");
const csv = require("csvtojson");

function escapeHtml(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  // simple html page with a script to load the ids

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Proxy</title>
</head>
<link href="https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/style.css" rel="stylesheet" type="text/css">
<body>

<table id="table" class="table table-striped table-bordered" style="width:100%">
</table>

</body>
<script src="https://cdn.jsdelivr.net/npm/simple-datatables@latest" type="text/javascript"></script>
  <script>
  const run = async () => {
    const res = await fetch('http://localhost:9000/logs');
    const ids = await res.json()
    console.log(ids)
    function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
    console.log(ids); 
    let dataTable = new simpleDatatables.DataTable("#table", {
      paging: false,
      data: {
        headings: [
          "Description",
          "Request URL",
        "Request Body",
          "IP Address",
        "Tags",
          "CVSS Score",
        "Qualitative Rating"
        ],
        data: ids.map((id) => Array.from(Object.values(id)).map(escapeHtml)),

      }
});
setTimeout(() => {
  window.location.reload()
}, 1500)
}
run()
  </script>
</html>

  `);
});

app.get("/logs", async (req, res) => {
  const jsonArray = await csv().fromFile(csvFilePath);
  return res.json(jsonArray);
});

const server = app.listen(9000, () =>
  console.log(`
🚀 Server ready at: http://localhost:9000`)
);
