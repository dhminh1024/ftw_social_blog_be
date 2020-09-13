const mongoose = require("mongoose");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Review = require("../models/Review");
const Reaction = require("../models/Reaction");
const Friendship = require("../models/Friendship");
const faker = require("faker");
const bcrypt = require("bcryptjs");

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
    await User.collection.drop();
    await Blog.collection.drop();
    await Review.collection.drop();
    await Reaction.collection.drop();
    await Friendship.collection.drop();
    // await mongoose.connection.dropDatabase();
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
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash("123", salt);
      await User.create({
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        avatarUrl: faker.image.avatar(),
        password,
        emailVerified: true,
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
          images: [
            faker.image.imageUrl(400, 300),
            faker.image.imageUrl(400, 300),
          ],
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
