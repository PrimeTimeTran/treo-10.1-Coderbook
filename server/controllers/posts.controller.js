const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Reaction = require("../models/Reaction");

const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");

const postController = {};

postController.create = catchAsync(async (req, res) => {
  const post = await Post.create({ owner: req.userId, ...req.body });
  res.json(post);
});

postController.read = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post)
    return next(new AppError(404, "Post not found", "Get Single Post Error"));

  await post.populate("owner").populate("comments");
  await post.execPopulate();

  res.json(post);
});

postController.update = catchAsync(async (req, res) => {
  await Post.findByIdAndUpdate(
    { _id: req.params.id },
    { email: req.body.email },
    { new: true },
    (err, post) => {
      console.log({ err, post });
      if (!post) {
        res.status(404).json({ message: "Post not Found" });
      } else {
        res.json(post);
      }
    },
  );
});

postController.destroy = catchAsync(async (req, res) => {
  await Post.findByIdAndDelete(req.params.id, (err, post) => {
    if (!post) {
      res.status(404).json({ message: "Post not Found" });
    } else {
      res.json(post);
    }
  });
});

postController.getHomePagePosts = catchAsync(async (req, res) => {
  // const posts = await Post.find({}).sort({ _id: -1 });
  const posts = await Post.find({}).sort({ _id: -1 })
    .populate("owner")
    .populate({
      path: "reactions",
      populate: {
        path: "owner",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "owner",
      },
    });

  return sendResponse(res, 200, true, { posts }, null, "Login successful");
});

postController.createComment = catchAsync(async (req, res) => {
  const comment = await Comment.create({
    owner: req.userId,
    ...req.body,
    post: req.params.id,
  });
  const post = await Post.findById(req.params.id);
  await post.comments.unshift(comment._id);
  await post.save();
  await post.populate({
    path: "comments",
    populate: {
      path: "owner",
    },
  }).execPopulate()
  return sendResponse(res, 200, true, { post }, null, "Login successful");
});

postController.createReaction = catchAsync(async (req, res) => {
  const reaction = await Reaction.create({
    owner: req.userId,
    ...req.body,
    post: req.params.id,
  });
  const post = await Post.findById(req.params.id);
  await post.reactions.push(reaction._id)
  await post.save()
  return sendResponse(res, 200, true, { reaction }, null, "Login successful");
});

module.exports = postController;
