const fs = require("fs");
const express = require("express");
const ejs = require("ejs");
const app = express();

app.use(express.urlencoded({ extended: true }));

const prisma = require("@prisma/client");
const client = new prisma.PrismaClient();

app.get("/", async (request, response) => {
  const filterByFrom = request.query.from ?? "";
  const mails = await client.$queryRawUnsafe(`
    SELECT * FROM "Mail" WHERE "from" = '${filterByFrom}';
  `);
  const filteredMails = mails.map((mail) => ({
    from: mail.from,
    to: mail.to,
    subject: mail.subject,
    content: mail.content,
  }));
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, {
    mails: filteredMails,
  });
  response.send(html);
});

app.post("/send", async (request, response) => {
  await client.$queryRawUnsafe(`
    INSERT INTO "Mail" ("from", "to", "subject" ,"content") VALUES ('${request.body.from}', '${request.body.to}','${request.body.subject}', '${request.body.content}');
  `);
  response.send("送信済み");
});

app.listen(3000);
