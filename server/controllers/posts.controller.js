const mongoose = require("mongoose");

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
  const posts = await Post.find({})
    .sort({ _id: -1 })
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
      populate: {
        path: "reactions",
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
  await post
    .populate({
      path: "comments",
      populate: {
        path: "owner",
      },
    })
    .execPopulate();
  return sendResponse(res, 200, true, { post }, null, "Login successful");
});

// postController.createReaction = catchAsync(async (req, res) => {
//   const reaction = await Reaction.create({
//     ...req.body,
//     owner: req.userId,
//   });

//   const reactionableKlass = await mongoose
//     .model(req.body.reactionableType)
//     .findById(req.params.id);
//   await reactionableKlass.reactions.push(reaction._id);
//   await reactionableKlass.save();
//   return sendResponse(
//     res,
//     200,
//     true,
//     { reactionableKlass, reaction },
//     null,
//     "Login successful",
//   );
// });
postController.createReaction = catchAsync(async (req, res) => {
  const reaction = await Reaction.create({
    ...req.body,
    owner: req.userId,
  });

  // let post, comment, photo, message
  // console.log({ foo: req.body.reactionableType });
  // if (req.body.reactionableType === 'Post') {
  //   post = await Post.findById(req.params.id)
  //   await post.reactions.push(reaction._id)
  //   await post.save()
  //   await reaction.save()
  // }
  // if (req.body.reactionableType === 'Comment') {
  //   comment = await Comment.findById(req.params.id)
  //   await comment.reactions.push(reaction._id)
  //   await comment.save()
  //   await reaction.save()
  // }
  // if (req.body.reactionableType === 'Photo') {
  //   photo = await Photo.findById(req.params.id);
  //   await photo.reactions.push(reaction._id)
  //   await photo.save()
  //   await reaction.save()
  // }
  // if (req.body.reactionableType === 'Message') {
  //   message = await Message.findById(req.params.id);
  //   await message.reactions.push(reaction._id);
  //   await message.save();
  //   await reaction.save()
  // }

    const reactionableKlass = await mongoose
      .model(req.body.reactionableType)
      .findById(req.params.id);

    await reactionableKlass.reactions.push(reaction._id)
    await reactionableKlass.save();
    await reaction.save()

  return sendResponse(res, 200, true, { reactionableKlass, reaction }, null, "Reacted!");
});

module.exports = postController;
