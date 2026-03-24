import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

// Predefined favorite songs list
export const FAVORITE_SONGS = [
  "Tum Hi Ho – Arijit Singh",
  "Kesariya – Arijit Singh",
  "Raataan Lambiyan – Jubin Nautiyal",
  "Believer – Imagine Dragons",
  "Blinding Lights – The Weeknd",
  "Shape of You – Ed Sheeran",
  "Bohemian Rhapsody – Queen",
  "Levitating – Dua Lipa",
  "Stay – The Kid LAROI",
  "As It Was – Harry Styles",
  "Ik Vaari Aa – Arijit Singh",
  "Channa Mereya – Arijit Singh",
  "Apna Bana Le – Arijit Singh",
  "Let Her Go – Passenger",
  "Perfect – Ed Sheeran",
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: (v) => !v || /^\+?[\d\s\-()]{7,15}$/.test(v),
        message: "Please provide a valid phone number",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    favoriteGenre: {
      type: String,
      enum: {
        values: FAVORITE_SONGS,
        message: "Please select a valid favorite song",
      },
      default: "",
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

//
// 🔐 Hash password before save
//
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

//
// 🕒 Update passwordChangedAt
//
userSchema.pre("save", async function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

//
// 🚫 Exclude inactive users
//
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

//
// 🔑 Compare passwords
//
userSchema.methods.correctPassword = async function (candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

//
// 🔍 Check if password changed after JWT
//
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedAt;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
export default User;