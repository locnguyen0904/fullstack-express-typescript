import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate-v2';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export const userRoles = [UserRole.Admin, UserRole.User] as const;

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  deletedAt?: Date;
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
      private: true,
    },
    role: {
      type: String,
      enum: userRoles,
      default: UserRole.User,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
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

UserSchema.method(
  'isPasswordMatch',
  async function (password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
);

UserSchema.static(
  'isEmailTaken',
  async function (
    email: string,
    excludeUserId?: mongoose.Types.ObjectId
  ): Promise<boolean> {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
  }
);

UserSchema.plugin(mongoosePaginate);

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
