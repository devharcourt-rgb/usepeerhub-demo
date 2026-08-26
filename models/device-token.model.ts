import { Schema, model, Document, SchemaTypes } from 'mongoose';

export interface IDeviceToken extends Document {
  user_id: any;
  token: string;
  platform?: string; // 'ios' | 'android' | 'web'
  source: string;
}

const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    user_id: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      unique: false,
      required: [true, 'Please User is Required'],
    },
    platform: {
      type: String,
      default: undefined,
    },
    source: {
      type: String,
      default: 'firebase',
    },
    token: {
      type: String,
      required: [true, 'Device token is Required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DeviceToken = model<IDeviceToken>('DeviceToken', deviceTokenSchema);

export default DeviceToken;
