import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcryptjs from 'bcryptjs';
import { addSeconds } from 'date-fns';
import { Model } from 'mongoose';

import { appConfig } from '../../config/appConfig.js';
import { AppException } from '../../lib/appException.lib.js';
import { AppResponse } from '../../lib/appResponse.lib.js';
import { EmailService } from '../../lib/emailService.lib.js';
import { TokenModel, TokenType } from '../../model/token.model.js';
import { UserModel } from '../../model/user.model.js';
import { AuthJwtService } from './authJwt.service.js';
import { DtoSignupInput } from './dto/signup.input.dto.js';
import { DtoVerifyInput } from './dto/verify.input.dto.js';
import { DtoVerifyLinkInput } from './dto/verifyLink.input.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    @InjectModel(TokenModel.name) private tokenModel: Model<TokenModel>,

    private readonly authJwtService: AuthJwtService
  ) {}

  async signup(dtoSignupInput: DtoSignupInput): Promise<AppResponse> {
    const emailExist = await this.userModel.findOne({ email: dtoSignupInput.email });
    if (emailExist)
      throw new AppException({ message: 'Email already exist', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'signup',
      });

    const phoneExist = await this.userModel.findOne({ phoneNumber: dtoSignupInput.phoneNumber });
    if (phoneExist)
      throw new AppException({ message: 'Phone number already exist', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'signup',
      });

    const passwordHash = await bcryptjs.hash(dtoSignupInput.password, 10);

    const newUser = await this.userModel.create({
      firstName: dtoSignupInput.firstName,
      lastName: dtoSignupInput.lastName,
      email: dtoSignupInput.email,
      passwordHash: passwordHash,
      dob: dtoSignupInput.dob,
      phoneNumber: dtoSignupInput.phoneNumber,
    });

    const verifyToken = await this.authJwtService.encodeVerifyToken({ id: newUser.id });

    await this.tokenModel.create({
      user: newUser._id,
      token: verifyToken,
      tokenType: TokenType.VERIFY_TOKEN,
      expireAt: addSeconds(new Date(), appConfig.tokenExpiration.VERIFY_TOKEN_EXPIRATION),
    });

    await EmailService.sendEmail('User Verification Link', `token: ${verifyToken}`, dtoSignupInput.email);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Signup success, proceed to verification',
      data: {},
    };
  }

  async verifyLink(dtoVerifyLinkInput: DtoVerifyLinkInput): Promise<AppResponse> {
    const user = await this.userModel.findOne({ email: dtoVerifyLinkInput.email });

    if (!user)
      throw new AppException({ message: 'Invalid User', error: {} }, HttpStatus.BAD_REQUEST, { cause: {}, description: 'verifyLink' });

    const passwordCompare = await bcryptjs.compare(dtoVerifyLinkInput.password, user.passwordHash);

    if (!passwordCompare) {
      throw new AppException({ message: 'Invalid Credentials', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verifyLink',
      });
    }

    const verifyToken = await this.authJwtService.encodeVerifyToken({ id: user.id });

    const currentTimeStamp = new Date();

    await this.tokenModel.updateOne(
      { user: user._id, tokenType: TokenType.VERIFY_TOKEN },
      {
        $set: {
          token: verifyToken,
          issuedAt: currentTimeStamp,
          expireAt: addSeconds(currentTimeStamp, appConfig.tokenExpiration.VERIFY_TOKEN_EXPIRATION),
        },
      },
      { upsert: true }
    );

    await EmailService.sendEmail('User Verification Link', `token: ${verifyToken}`, user.email);

    return {
      success: true,
      message: 'Verification link sent successfully, proceed to verification',
      statusCode: HttpStatus.OK,
      data: {},
    };
  }

  async verify(dtoVerifyInput: DtoVerifyInput): Promise<AppResponse> {
    const verifyTokenDecoded = await this.authJwtService.decodeVerifyToken(dtoVerifyInput.verifyToken);

    const matchExistingToken = await this.tokenModel.findOne({
      user: verifyTokenDecoded.id,
      token: dtoVerifyInput.verifyToken,
      tokenType: TokenType.VERIFY_TOKEN,
    });

    if (!matchExistingToken)
      throw new AppException({ message: 'Invalid Verify Token', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verify',
      });

    const updatedUser = await this.userModel.findByIdAndUpdate(verifyTokenDecoded.id, { verified: true }, { new: true });

    if (!updatedUser)
      throw new AppException({ message: 'User not found', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verify',
      });

    await this.tokenModel.deleteOne({ _id: matchExistingToken._id });

    return {
      success: true,
      message: 'Verification successful',
      statusCode: HttpStatus.OK,
      data: {},
    };
  }
}
