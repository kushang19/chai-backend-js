import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
  try {
     return jwt.sign(
          {
              _id: this.id,
              email: this.email,
              username: this.username,
              fullname: this.fullname
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
              expiresIn:  process.env.ACCESS_TOKEN_EXPIRY 
          }
  )
  } catch (error) {
    console.log("ACCESSTOKEN ERROR:: ", error);
    
  }
}
userSchema.methods.generateRefreshToken = async function() {
  try{
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:  process.env.REFRESH_TOKEN_EXPIRY 
        }
)
  }
  catch(err){
    console.log("REFRESHTOKEN ERROR:: ", err);
    
  }
}

export const User = mongoose.model("User", userSchema);
