Good — now we’re getting into the right pattern 👍
You created a ModelModule, now let’s use it properly.

🧠 Step 1 — Your ModelModule
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: TokenModel.name, schema: TokenSchema },
    ]),
  ],
  exports: [MongooseModule], // 👈 important
})
export class ModelModule {}

👉 This makes both models available to other modules

🧠 Step 2 — Import in Feature Module

Example: AuthModule

@Module({
  imports: [ModelModule], // 👈 import here
  providers: [AuthService],
})
export class AuthModule {}
🧠 Step 3 — Inject Models in Service

Now you can use @InjectModel normally 👇

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserModel>,

    @InjectModel(TokenModel.name)
    private tokenModel: Model<TokenModel>,
  ) {}
}
🔥 That’s it — it just works

👉 Because:

ModelModule exports MongooseModule
Nest shares providers across modules
⚠️ Common Mistakes
❌ Forgetting export
exports: [MongooseModule] ❗ REQUIRED
❌ Not importing ModelModule
imports: [] ❌

👉 Then injection fails

❌ Wrong model name
@InjectModel('user') ❌

👉 Use:

@InjectModel(UserModel.name) ✅
🧠 Optional Improvement (Cleaner Tokens)

Instead of:

@InjectModel(UserModel.name)

You can define constants:

export const USER_MODEL = UserModel.name;
🚀 Final Flow
ModelModule
   ↓ exports
AuthModule imports ModelModule
   ↓
AuthService injects UserModel + TokenModel
💬 Final Answer

👉 To use models from ModelModule:

Export MongooseModule ✅
Import ModelModule in your module ✅
Use @InjectModel() in service ✅

If you want next:

I can show how to split ModelModule into smaller modules (scalable version)
Or add repository layer on top of Mongoose (very clean architecture) 🚀