---
title: FTW Week 8 - Social Blog API
tags: CoderSchool, FTW, Project
---

# Social Blog API

## Introductions

## Implementation

### Setup project

- Create an express app using `express-generator`:
  ```bash
  mkdir social-blog-api
  cd social-blog-api
  mkdir server
  cd server
  npx express-generator --no-view
  npm install
  git init
  ```
- Install `nodemon` to keep tracking your changes and automatically restart server:
  ```bash
  npm install --save-dev nodemon
  ```
  Open `package.json`, add `"dev": "nodemon ./bin/www"` to `"scripts: {..}"`
- Install dependencies:
  ```bash
  npm i dotenv cors
  npm i mongoose
  ```
- Remove everything in `public/`
- Create `\.env`:
  ```
  PORT=5000
  ```
  Install `dotenv`: `npm i dotenv`. Then add `require("dotenv").config();` in `/bin/wwww`:
  ```javascript
  require("dotenv").config();
  var app = require("../app");
  var debug = require("debug")("server:server");
  ```
- Create `\.gitignore`:
  ```
  node_modules/
  .DS_Store
  .vscode/
  *lock.json
  build
  .env
  config/
  ```
- In `/routes/index.js`, replace `res.render('index', { title: 'Express' });` with
  ```javascript
  res.send({status:'ok', data:"Hello World!"});
  ```
- Test the app: `npm run dev`, then open `localhost:5000` on the browser.
- Commit git for the first time.
