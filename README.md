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
  npx express-generator --no-view
  npm install
  git init
  ```
- Install `nodemon` to keep tracking your changes and automatically restart server:
  ```bash
  npm install --save-dev nodemon faker
  ```
  Open `package.json`, add `"dev": "nodemon ./bin/www"` to `"scripts: {..}"`
- Install dependencies:
  ```bash
  npm i dotenv cors
  npm i mongoose multer mkdirp
  npm i jsonwebtoken bcryptjs express-validator
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

### Project structure

```
|- bin/
|- controllers/
|- helpers/
|- middlewares/
|- models/
|- public/
|- routes/
|- app.js
```

### Setup `app.js`

- Create `/helpers/utils.helper.js`:
  ```javascript
  "use strict";
  const utilsHelper = {};
  
  // This function controls the way we response to the client
  // If we need to change the way to response later on, we only need to handle it here
  utilsHelper.sendResponse = (res, status, success, data, errors, message) => {
    const response = {};
    if (success) response.success = success;
    if (data) response.data = data;
    if (errors) response.errors = errors;
    if (message) response.message = message;
    return res.status(status).json(response);
  };

  module.exports = utilsHelper;
  ```
  In `app.js`, add: `const utilsHelper = require("./helpers/utils.helper");`

- In `routes/`, delete `users.js`. In `app.js`,remove
  ```diff
  -const usersRouter = require("./routes/users");
  ...
  -app.use("/users", usersRouter);
  ```

- Import `cors`:
  ```diff
  +const cors = require("cors")
  ...
  app.use(cookieParser());
  +app.use(cors());
  ```

- Connect to DB
  - In `.env`, add
  ```
  MONGODB_URI='mongodb://localhost:27017/social_blog'
  ```
  - In `app.js`:
  ```javascript
  const mongoose = require('mongoose')
  const mongoURI = process.env.MONGODB_URI
  ...
  app.use(cookieParser());

  /* DB Connections */
  mongoose
    .connect(mongoURI, {
      // some options to deal with deprecated warning
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => console.log(`Mongoose connected to ${mongoURI}`))
    .catch((err) => console.log(err));
  ```

- Error Handling: In `app.js`, add
  ```javascript
  /* Initialize Routes */
  app.use("/api", indexRouter);

  // catch 404 and forard to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.statusCode = 404;
    next(err);
  });

  /* Initialize Error Handling */
  app.use((err, req, res, next) => {
    console.log("ERROR", err.message);
    return utilsHelper.sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      [{ message: err.message }],
      null
    );
  });

  module.exports = app;
  ```
- Test `localhost:5000\api\`, `localhost:5000\whatever`

### Design the endpoints

- Authentication
```javascript
/** 
 * @route POST api/auth/login 
 * @route GET api/auth/logout 
 */
```
- User model
```javascript
/** 
 * @route POST api/users - Register
 * @route GET api/users?page=1&limit=20
 * @route GET api/users/me - Get current user
 * @route POST api/users/me/avatar - Upload avatar
 * @route PUT api/users/me - Update user info
 * @route PUT api/users/me/password - Change Password
 */
```
- Blog model
```javascript
/** 
 * @route GET api/blogs?page=1&limit=10 - Get blogs with pagination
 * @route GET api/users/:id/blogs?page=1&limit=20 - Get blogs from user
 * @route GET api/blogs/friends?page=1&limit=20 - Get blogs from friends
 * @route GET api/blogs/:id - Get blog detail
 * @route POST api/blogs/:id - Create a new blog
 * @route PUT api/blogs/:id - Update a blog
 * @route DELETE api/blogs/:id - Remove a blog
 */
```
- Review model
```javascript
/** 
 * @route GET api/blogs/:id/reviews?page=1&limit=10 - Get reiviews from a blog
 * @route POST api/blogs/:id/reviews - Create new review for a blog
 * @route PUT api/blogs/:id/reviews/:id - Update review
 * @route DELETE api/blogs/:id/reviews/:id - Delete review
 */
```
- Reaction
```javascript
/** 
 * @route POST api/reactions
 */
```
- Friends
```javascript
/** 
 * @route GET api/friends/manage/:id - Get the list of friends
 * @route GET api/friends/add/:id - Get the list of friend requests
 * @route POST api/friends/add/:id - Send friend request
 * @route POST api/friends/manage/:id - Accept Request
 * @route DELETE api/friends/add/:id - Remove Friend request
 * @route DELETE api/friends/manage/:id - Decline Request
 */
```

### Design the DB

When modeling "One-to-Many" relationship in MongoDB, you have a variety of choices, so you have to carefully think through the structure of your data. The main criteria you need to consider are:
  - What is the cardinality of the relationships: "one-to-few", "one-to-many", "one-to-squillions"?
  - Do you need to access the object on the "N" side separately, or only in the context of the parent object?
  - What is the ratio of updates to reads for a particular field?
Your main choices for structuring the data are:
  - For "one-to-few", you can use an array of embedded documents
  - For "one-to-many", or when the "N" side must stand alone, you should use an array of references. You can also use the "parent-reference" on the "N" side if it optimizes your data access pattern.
  - For "one-to-squillions", you should use a "parent-reference" in the document storing the "N" side.

The "One-to-Many" relationships in this app are:
  - An User can write many blogs -> "one-to-squillions", we won't limit the number of blogs a user can write. So we will use a user reference in the blog schema.

  - An User can have many friends which are also users -> here it seems like the relationship friendship occurs in only one context user. But it's actually two. If we store a list of friends as an array of references, then when we want to update (e.g. user removes a friend), we need to update two lists from each user. Basically, this relationship is "many-to-many". The solution here is a new schema `friendship` which contains `from`, `to` (user ID of the one who sent the friend request and the one who received it), and `status` (requesting, accepted, decline, removed).

  - A blog can have unlimited reviews and user can react to a review -> so we use "parent-reference" to `user` and `blog` concept in the schema `reactions`.

  - User can react (laugh, sad, like, love, angry) to a blog or a review -> the reactions occur in two contexts (blog and review) so we need to create a schema for it. The relationship between blog to reactions and review to reactions is unlimited ("one-to-squillions"), so we use "parent-reference" to `user` and `blog` concept in the schema `reactions`. In addition, because we need to sum the reactions in each group and show it as the content of blog and reviews, we will denormalize that information and put it in the `blog` and `review` schema.

- Create `models/user.js`:
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  friendCount: { type: Number, default: 0 },
  isDeleted: {type: Boolean, default:false},
})

module.exports = mongoose.model("User", userSchema);
```
- Create `models/friendship.js`:
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendshipSchema = Schema({
  from: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  to: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  status: {
    type: String,
    enum: ["requesting", "accepted", "decline", "removed", "cancel"],
  },
});

module.exports = mongoose.model("Friendship", friendshipSchema);
```
- Create `models/blog.js`:
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reactions: {
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
  reviewCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Blog", blogSchema);
```
- Create `models/review.js`:
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  blog: { type: mongoose.Schema.ObjectId, required: true, ref: "Blog" },
  reactions: {
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Review", reviewSchema);
```
- Create `models/reaction.js`:
```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reactionSchema = Schema({
  user: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  targetType: { type: String, required: true, enum: ["Blog", "Review"] },
  target: {
    type: mongoose.Schema.ObjectId,
    required: true,
    refPath: "targetType",
  },
  emoji: {
    type: String,
    required: true,
    enum: ["laugh", "sad", "like", "love", "angry"],
  },
});

module.exports = mongoose.model("Reaction", reactionSchema);
```

### Testing the schema

- In `.gitignore`, add `testing/`
- Create `/testing/testSchema.js`:
  ```javascript
  const mongoose = require("mongoose");
  const User = require("../models/user");
  const Blog = require("../models/blog");
  const Review = require("../models/review");
  const Reaction = require("../models/reaction");
  const Friendship = require("../models/friendship");
  const faker = require("faker");

  /**
  * Returns a random integer between min (inclusive) and max (inclusive).
  * The value is no lower than min (or the next integer greater than min
  * if min isn't an integer) and no greater than max (or the next integer
  * lower than max if max isn't an integer).
  * Using Math.round() will give you a non-uniform distribution!
  */
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const cleanData = async (startTime) => {
    try {
      // await User.collection.drop();
      // await Blog.collection.drop();
      // await Review.collection.drop();
      // await Reaction.collection.drop();
      // await Friendship.collection.drop();
      await mongoose.connection.dropDatabase();
      console.log("| Deleted all data");
      console.log("-------------------------------------------");
    } catch (error) {
      console.log(error);
    }
  };

  const generateData = async () => {
    try {
      await cleanData();
      let users = [];
      let blogs = [];
      console.log("| Create 10 users:");
      console.log("-------------------------------------------");
      const userNum = 10;
      const otherNum = 3; // num of blog each user, reviews or reactions each blog
      for (let i = 0; i < userNum; i++) {
        await User.create({
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: "123",
        }).then(function (user) {
          console.log("Created new user: " + user.name);
          users.push(user);
        });
      }
      console.log(`| Each user has 2 friends`);
      console.log("-------------------------------------------");
      for (let i = 0; i < userNum; i++) {
        await Friendship.create({
          from: users[i]._id,
          to: users[i + 1 < userNum ? i + 1 : 0]._id,
          status: "accepted",
        });
      }
      console.log(`| Each user writes ${otherNum} blogs`);
      console.log("-------------------------------------------");
      for (let i = 0; i < userNum; i++) {
        for (let j = 0; j < otherNum; j++) {
          await Blog.create({
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            author: users[i]._id,
          }).then(async (blog) => {
            console.log("Created blog:" + blog.title);
            blogs.push(blog);

            console.log(
              `| Each blog has ${otherNum} reviews from ${otherNum} random users`
            );
            console.log("-------------------------------------------");
            for (let k = 0; k < otherNum; k++) {
              await Review.create({
                content: faker.lorem.sentence(),
                user: users[getRandomInt(0, userNum - 1)]._id,
                blog: blog._id,
              });
            }

            console.log(
              `| Each blog has ${otherNum} reactions from ${otherNum} random users`
            );
            console.log("-------------------------------------------");
            const emojis = ["laugh", "sad", "like", "love", "angry"];
            for (let k = 0; k < otherNum; k++) {
              await Reaction.create({
                content: faker.lorem.sentence(),
                user: users[getRandomInt(0, userNum - 1)]._id,
                targetType: "Blog",
                target: blog._id,
                emoji: emojis[getRandomInt(0, 4)],
              });
            }
          });
        }
      }
      console.log("| Generate Data Done");
      console.log("-------------------------------------------");
    } catch (error) {
      console.log(error);
    }
  };

  const getRandomBlogs = async (blogNum) => {
    console.log(`Get ${blogNum} random blogs`);
    const totalBlogNum = await Blog.countDocuments();
    for (let i = 0; i < blogNum; ++i) {
      const blog = await Blog.findOne()
        .skip(getRandomInt(0, totalBlogNum - 1))
        .populate("author");
      console.log(blog);
    }
  };

  const main = async (resetDB = false) => {
    if (resetDB) await generateData();
    getRandomBlogs(1);
  };

  main(true);
  ```
- In `app.js`, add:
  ```javascript
  console.log(`Mongoose connected to ${mongoURI}`);
  require("./testing/testSchema");
  ```

### Adding middlewares & plugins

#### Add `createdAt` and `updatedAt` to every model

- Create `models/plugins/modifiedAt.js`:
  ```javascript
  module.exports = exports = modifiedAt = function (schema, options) {
    schema.add({ updatedAt: Date });
    schema.add({ createdAt: Date });
    schema.pre("save", function (next) {
      this.updatedAt = Date.now();
      if (!this.createdAt) {
        this.createdAt = Date.now();
      }
      next();
    });
  };
  ```
- In `app.js`, add:
  ```javascript
  /* DB Connections */
  mongoose.plugin(require("./models/plugins/modifiedAt"));
  mongoose.connect(mongoURI, {...
  ```

#### Add `isDeleted: false` to every query for user or blog

- Create `models/plugins/isDeletedFalse.js`, add:
  ```javascript
  module.exports = exports = isDeletedFalse = function (schema, options) {
    schema.pre(/^find/, function (next) {
      if (this._conditions["isDeleted"] === undefined)
        this._conditions["isDeleted"] = false;
      next();
    });
  };
  ```
- In `models/blog.js`, add:
  ```javascript
  blogSchema.plugin(require("./plugins/isDeletedFalse"));
  ```
- In `models/user.js`, add:
  ```javascript
  userSchema.plugin(require("./plugins/isDeletedFalse"));
  ```

#### Calculate number of review each blog

- In `models/review.js`, add:
  ```javascript
  // Calculate Review Count and update in Blog
  reviewSchema.statics.calculateReviews = async function (blogId) {
    const reviewCount = await this.find({ blog: blogId }).count();
    await Blog.findByIdAndUpdate(blogId, { reviewCount: reviewCount });
  };

  reviewSchema.post("save", function () {
    // this point to current review
    this.constructor.calculateReviews(this.blog);
  });

  // Neither findByIdAndUpdate norfindByIdAndDelete have access to document middleware.
  // They only get access to query middleware
  // Inside this hook, this will point to the current query, not the current review.
  // Therefore, to access the review, we’ll need to execute the query
  reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.doc = await this.findOne();
    next();
  });

  reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.doc.constructor.calculateReviews(this.doc.blog);
  });
  ```

#### Calculate number of friends of each user

- In `models/friendship.js`, add:
  ```javascript
  friendshipSchema.statics.calculateFriendCount = async function (userId) {
    const friendCount = await this.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    }).count();
    await User.findByIdAndUpdate(userId, { friendCount: friendCount });
  };

  friendshipSchema.post("save", function () {
    this.constructor.calculateFriendCount(this.from);
    this.constructor.calculateFriendCount(this.to);
  });

  friendshipSchema.pre(/^findOneAnd/, async function (next) {
    this.doc = await this.findOne();
    next();
  });

  friendshipSchema.post(/^findOneAnd/, async function (next) {
    await this.doc.constructor.calculateFriendCount(this.doc.from);
    await this.doc.constructor.calculateFriendCount(this.doc.to);
  });
  ```

#### Calculate number of each type of reactions of each blog

- In `models/reactions.js`, add:
  ```javascript
  reactionSchema.statics.calculateReaction = async function (
    targetId,
    targetType
  ) {
    const stats = await this.aggregate([
      {
        $match: { target: targetId },
      },
      {
        $group: {
          _id: "$target",
          laugh: {
            $sum: {
              $cond: [{ $eq: ["$emoji", "laugh"] }, 1, 0],
            },
          },
          sad: {
            $sum: {
              $cond: [{ $eq: ["$emoji", "sad"] }, 1, 0],
            },
          },
          like: {
            $sum: {
              $cond: [{ $eq: ["$emoji", "like"] }, 1, 0],
            },
          },
          love: {
            $sum: {
              $cond: [{ $eq: ["$emoji", "love"] }, 1, 0],
            },
          },
          angry: {
            $sum: {
              $cond: [{ $eq: ["$emoji", "angry"] }, 1, 0],
            },
          },
        },
      },
    ]);
    await mongoose.model(targetType).findByIdAndUpdate(targetId, {
      reactions: {
        laugh: (stats[0] && stats[0].laugh) || 0,
        sad: (stats[0] && stats[0].sad) || 0,
        love: (stats[0] && stats[0].love) || 0,
        like: (stats[0] && stats[0].like) || 0,
        angry: (stats[0] && stats[0].angry) || 0,
      },
    });
  };

  reactionSchema.post("save", function () {
    // this point to current review
    this.constructor.calculateReaction(this.target, this.targetType);
  });

  reactionSchema.pre(/^findOneAnd/, async function (next) {
    this.doc = await this.findOne();
    next();
  });

  reactionSchema.post(/^findOneAnd/, async function (next) {
    await this.doc.constructor.calculateReaction(
      this.doc.target,
      this.doc.targetType
    );
  });
  ```

### Setup Routes and Controllers

#### 
