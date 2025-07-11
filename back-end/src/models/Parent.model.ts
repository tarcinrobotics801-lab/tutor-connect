import mongoose, { Schema, model, HydratedDocument } from 'mongoose';

interface Child {
  name: string;
  age: number;
  class: string;
  schoolName: string;
  place: string;
}

export interface IParent {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'parent';
  profileCompleted: boolean;
  occupation?: string;
  parentType?: 'father' | 'mother';
  children?: Child[];
  studentId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ParentDocument = HydratedDocument<IParent>;

const ChildSchema = new Schema<Child>(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    class: { type: String, required: true },
    schoolName: { type: String, required: true },
    place: { type: String, required: true },
  },
  { _id: false }
);

const parentSchema = new Schema<IParent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'parent', enum: ['parent'] },
    profileCompleted: { type: Boolean, default: false },
    occupation: { type: String },
    parentType: { type: String, enum: ['father', 'mother'] },
    children: { type: [ChildSchema], default: [] },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  },
  {
    timestamps: true,
  }
);

export const Parent = model<IParent>('Parent', parentSchema);