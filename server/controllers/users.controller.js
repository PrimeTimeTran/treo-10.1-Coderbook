const bcrypt = require("bcryptjs");
const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const User = require("../models/User");

const userController = {};

userController.create = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;
  let user = await User.findOne({ email });

  if (user)
    return next(new AppError(409, "User already exists", "Register Error"));

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({
    email,
    password,
  });

  await user.save()
  
  const accessToken = await user.generateToken();
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successful"
  );
})

userController.read = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    res.status(404).json({ message: "User not Found" });
  } else {
    res.json(user);
  }
};

// CRUD USER

userController.update = async (req, res) => {
  console.log({ khoi: req.body })
  await User.findByIdAndUpdate(
    { _id: req.userId },
    { email: req.body.email, avatarUrl: req.body.avatarUrl },
    { new: true },
    (err, user) => {
      console.log({ err, user });
      if (!user) {
        res.status(404).json({ message: "User not Found" });
      } else {
        res.json(user);
      }
    },
  );
};

userController.destroy = async (req, res) => {
  await User.findByIdAndDelete(req.params.id, (err, user) => {
    console.log({ err, user });
    if (!user) {
      res.status(404).json({ message: "User not Found" });
    } else {
      res.json(user);
    }
  });
};

module.exports = userController;
