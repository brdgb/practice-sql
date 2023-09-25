const fs = require("fs");
const express = require("express");
const ejs = require("ejs");
const app = express();

app.use(express.urlencoded({ extended: true }));

const prisma = require("@prisma/client");
const client = new prisma.PrismaClient();

app.get("/", async (request, response) => {
  const posts = (await client.Post.findMany()).map((post) => ({
    user: post.user,
    content: post.content,
  }));
  const template = fs.readFileSync("template.ejs", "utf-8");
  const html = ejs.render(template, {
    posts: posts,
  });
  response.send(html);
});

app.post("/send", async (request, response) => {
  await client.Post.create({
    data: { user: request.body.user, content: request.body.content },
  });
  response.send("送信済み");
});

app.listen(3000);
