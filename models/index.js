const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const User = require("./user");
const Post = require("./post");
const Comment = require("./comment");
const ReComment = require("./recomment");
const Like = require("./like");
const Hashtag = require("./hashtag");
const Record = require("./record");
const Location = require("./location");
const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Comment = Comment;
db.ReComment = ReComment;
db.Like = Like;
db.Hashtag = Hashtag;
db.Record = Record;
db.Location = Location;

User.init(sequelize);
Post.init(sequelize);
Comment.init(sequelize);
ReComment.init(sequelize);
Like.init(sequelize);
Hashtag.init(sequelize);
Record.init(sequelize);
Location.init(sequelize);
User.associate(db);
Post.associate(db);
Comment.associate(db);
ReComment.associate(db);
Like.associate(db);
Hashtag.associate(db);
Record.associate(db);
Location.associate(db);
module.exports = db;
