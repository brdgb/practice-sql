const fs = require("fs");
const express = require("express");
const ejs = require("ejs");
const app = express();

app.use(express.urlencoded({ extended: true }));

const prisma = require("@prisma/client");
const client = new prisma.PrismaClient();

app.use("/css", express.static("css"));
app.use("/img", express.static("img"));

app.get("/", async (request, response) => {
  const mails = request.query.from
    ? await client.$queryRawUnsafe(`
    SELECT * FROM "Mail" WHERE "from" = '${request.query.from}' AND "to" = '駒場 優' ORDER BY "id" DESC;
  `)
    : await client.$queryRawUnsafe(`
    SELECT * FROM "Mail" WHERE "to" = '駒場 優' ORDER BY "id" DESC;
  `);

  const extractedMails = mails.map((mail) => ({
    from: mail.from,
    toType: mail.toType,
    to: mail.to,
    date: mail.date,
    subject: mail.subject,
    content: mail.content,
  }));
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, {
    queryFrom: request.query.from,
    mails: extractedMails,
  });
  response.send(html);
});

app.listen(3000);
