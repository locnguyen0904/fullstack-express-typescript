import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseDelete from 'mongoose-delete';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

import { BaseDocument } from '@/core';
import { applyPlugin } from '@/helpers';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export const userRoles = [UserRole.Admin, UserRole.User] as const;

export interface IUser extends BaseDocument {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  isPasswordMatch(password: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  isEmailTaken(
    email: string,
    excludeUserId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
}

const UserSchema = new Schema<IUser, IUserModel>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: userRoles,
      default: UserRole.User,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

UserSchema.methods.isPasswordMatch = async function (
  password: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};
applyPlugin(UserSchema, mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});
applyPlugin(UserSchema, mongooseAggregatePaginate);
applyPlugin(UserSchema, mongoosePaginate);

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
