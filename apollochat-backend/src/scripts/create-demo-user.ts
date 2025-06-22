import * as bcrypt from 'bcrypt';
import { connect, model, Schema } from 'mongoose';
import * as dotenv from 'dotenv';
import { AbstractEntity } from '../common/database/abstract.entity';
import { Types } from 'mongoose';

// Load environment variables
dotenv.config();

// Define schemas for the models we need
const UserSchema = new Schema(
  {
    email: String,
    username: String,
    password: String,
    googleId: String,
    status: {
      type: String,
      enum: ['online', 'away', 'dnd', 'offline'],
      default: 'offline',
    },
  },
  { timestamps: true },
);

const OtpSchema = new Schema(
  {
    email: String,
    otp: String,
    expiresAt: Date,
    verified: Boolean,
  },
  { timestamps: true },
);

async function createDemoUser() {
  // Connect to MongoDB
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable not set');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await connect(mongoUri);
  console.log('Connected to MongoDB');

  // Create models
  const UserModel = model('User', UserSchema);
  const OtpModel = model('OtpVerification', OtpSchema);

  // Check if demo user already exists
  const existingUser = await UserModel.findOne({
    email: 'demo@apollochat.com',
  });

  if (existingUser) {
    console.log('Demo user already exists');
    return;
  }

  try {
    // Create demo user
    const demoUser = new UserModel({
      email: 'demo@apollochat.com',
      username: 'DemoUser',
      password: await bcrypt.hash(process.env.DEMO_PASSWORD, 10),
      status: 'online',
    });

    // Save to database
    await demoUser.save();
    console.log('Demo user created successfully');

    // Create verified OTP record so the user can log in
    const otpVerification = new OtpModel({
      email: 'demo@apollochat.com',
      otp: '123456', // Doesn't matter as we're setting verified to true
      verified: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    await otpVerification.save();
    console.log('Demo user email verification created');
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
}

createDemoUser()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
