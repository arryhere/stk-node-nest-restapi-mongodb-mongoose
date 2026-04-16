import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcryptjs from 'bcryptjs';
import { addSeconds } from 'date-fns';
import { Model, Types } from 'mongoose';

import { appConfig } from '../../config/appConfig.js';
import { AppException } from '../../exception/appException.exception.js';
import { EmailLibService } from '../../lib/email.lib.js';
import { JwtLibService } from '../../lib/jwt.lib.js';
import { TokenModel, TokenType } from '../../model/token.model.js';
import { UserModel } from '../../model/user.model.js';
import { TAppResponse } from '../../type/appResponse.type.js';
import { SigninInputDto } from './dto/signin.input.dto.js';
import { SignupInputDto } from './dto/signup.input.dto.js';
import { VerifyInputDto } from './dto/verify.input.dto.js';
import { VerifyLinkInputDto } from './dto/verifyLink.input.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
    @InjectModel(TokenModel.name) private readonly tokenModel: Model<TokenModel>,

    private readonly jwtLibService: JwtLibService,
    private readonly emailLibService: EmailLibService
  ) {}

  async signup(signupInputDto: SignupInputDto): Promise<TAppResponse> {
    const emailExist = await this.userModel.findOne({ email: signupInputDto.email });
    if (emailExist)
      throw new AppException({ message: 'Email already exist', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'signup',
      });

    const phoneExist = await this.userModel.findOne({ phoneNumber: signupInputDto.phoneNumber });
    if (phoneExist)
      throw new AppException({ message: 'Phone number already exist', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'signup',
      });

    const passwordHash = await bcryptjs.hash(signupInputDto.password, 10);

    const newUser = await this.userModel.create({
      firstName: signupInputDto.firstName,
      lastName: signupInputDto.lastName,
      email: signupInputDto.email,
      passwordHash: passwordHash,
      dob: signupInputDto.dob,
      phoneNumber: signupInputDto.phoneNumber,
    });

    const verifyToken = await this.jwtLibService.encodeVerifyToken({ id: newUser.id });

    await this.tokenModel.create({
      user: newUser._id,
      token: verifyToken,
      tokenType: TokenType.VERIFY_TOKEN,
      expireAt: addSeconds(new Date(), appConfig.tokenExpiration.VERIFY_TOKEN_EXPIRATION),
    });

    await this.emailLibService.sendEmail('User Verification Link', `token: ${verifyToken}`, signupInputDto.email);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Signup success, proceed to verification',
      data: {},
    };
  }

  async verifyLink(verifyLinkInputDto: VerifyLinkInputDto): Promise<TAppResponse> {
    const user = await this.userModel.findOne({ email: verifyLinkInputDto.email });

    if (!user)
      throw new AppException({ message: 'Invalid User', error: {} }, HttpStatus.BAD_REQUEST, { cause: {}, description: 'verifyLink' });

    const passwordCompare = await bcryptjs.compare(verifyLinkInputDto.password, user.passwordHash);

    if (!passwordCompare) {
      throw new AppException({ message: 'Invalid Credentials', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verifyLink',
      });
    }

    const verifyToken = await this.jwtLibService.encodeVerifyToken({ id: user.id });

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

    await this.emailLibService.sendEmail('User Verification Link', `token: ${verifyToken}`, user.email);

    return {
      success: true,
      message: 'Verification link sent successfully, proceed to verification',
      statusCode: HttpStatus.OK,
      data: {},
    };
  }

  async verify(verifyInputDto: VerifyInputDto): Promise<TAppResponse> {
    const verifyTokenDecoded = await this.jwtLibService.decodeVerifyToken(verifyInputDto.verifyToken);

    const matchExistingToken = await this.tokenModel.findOne({
      user: new Types.ObjectId(verifyTokenDecoded.id),
      token: verifyInputDto.verifyToken,
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

  async signin(signinInputDto: SigninInputDto): Promise<TAppResponse> {
    const user = await this.userModel.findOne({ email: signinInputDto.email });

    if (!user) {
      throw new AppException({ message: 'Invalid Credentials', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'signin',
      });
    }

    if (!user.verified) {
      throw new AppException({ message: 'User Unverified', error: {} }, HttpStatus.FORBIDDEN, {
        cause: {},
        description: 'signin',
      });
    }

    if (!user.active) {
      throw new AppException({ message: 'User Inactive', error: {} }, HttpStatus.FORBIDDEN, {
        cause: {},
        description: 'signin',
      });
    }

    const passwordCompare = await bcryptjs.compare(signinInputDto.password, user.passwordHash);

    if (!passwordCompare) {
      throw new AppException({ message: 'Invalid Credentials', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'signin',
      });
    }

    const accessToken = await this.jwtLibService.encodeAccessToken({ id: user.id });
    const refreshToken = await this.jwtLibService.encodeRefreshToken({ id: user.id });

    return {
      success: true,
      message: 'Signin successful',
      statusCode: HttpStatus.OK,
      data: { id: user.id, accessToken, refreshToken },
    };
  }
}
