const fs = require("fs");
const express = require("express");
const ejs = require("ejs");
const app = express();

app.use(express.urlencoded({ extended: true }));

const prisma = require("@prisma/client");
const client = new prisma.PrismaClient();

app.use("/css", express.static("css"));

app.get("/", async (request, response) => {
  const mails = request.query.from
    ? await client.$queryRawUnsafe(`
    SELECT * FROM "Mail" WHERE "from" = '${request.query.from}' AND "to" = 'you';
  `)
    : await client.$queryRawUnsafe(`
    SELECT * FROM "Mail" WHERE "to" = 'you';
  `);

  const extractedMails = mails.map((mail) => ({
    from: mail.from,
    to: mail.to,
    subject: mail.subject,
    content: mail.content,
  }));
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, {
    mails: extractedMails,
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
