import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IExample extends Document {
  title: string;
  content: string;
  deletedAt?: Date;
}

const ExampleSchema = new Schema<IExample>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ExampleSchema.plugin(mongoosePaginate);

const Example = mongoose.model<IExample>('Example', ExampleSchema);

export default Example;
