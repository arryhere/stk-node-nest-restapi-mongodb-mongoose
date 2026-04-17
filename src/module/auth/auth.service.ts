import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcryptjs from 'bcryptjs';
import { addSeconds } from 'date-fns';
import { Model, Types } from 'mongoose';

import { appConfig } from '../../config/appConfig.js';
import { AppException } from '../../exception/appException.exception.js';
import { CryptographyLibService } from '../../lib/cryptography.lib.js';
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
    private readonly emailLibService: EmailLibService,
    private readonly cryptographyLibService: CryptographyLibService
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

    const passwordHash = await bcryptjs.hash(signupInputDto.password, appConfig.bcrypt.BCRYPT_SALT_COST_FACTOR);

    const newUser = await this.userModel.create({
      firstName: signupInputDto.firstName,
      lastName: signupInputDto.lastName,
      email: signupInputDto.email,
      passwordHash: passwordHash,
      dob: signupInputDto.dob,
      phoneNumber: signupInputDto.phoneNumber,
    });

    const verifyToken = this.cryptographyLibService.generateVerifyToken(newUser.id, appConfig.tokenSecret.VERIFY_TOKEN_SECRET);
    const verifyTokenHash = await bcryptjs.hash(verifyToken, appConfig.bcrypt.BCRYPT_SALT_COST_FACTOR);

    await this.tokenModel.create({
      user: newUser._id,
      tokenHash: verifyTokenHash,
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

    const verifyToken = this.cryptographyLibService.generateVerifyToken(user.id, appConfig.tokenSecret.VERIFY_TOKEN_SECRET);
    const verifyTokenHash = await bcryptjs.hash(verifyToken, appConfig.bcrypt.BCRYPT_SALT_COST_FACTOR);

    const currentTimeStamp = new Date();

    await this.tokenModel.updateOne(
      { user: user._id, tokenType: TokenType.VERIFY_TOKEN },
      {
        $set: {
          tokenHash: verifyTokenHash,
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
    const verifyTokenDecoded = this.cryptographyLibService.decryptToken(
      verifyInputDto.verifyToken,
      appConfig.tokenSecret.VERIFY_TOKEN_SECRET
    );

    const userId = this.cryptographyLibService.getUserIdFromDecryptedToken(verifyTokenDecoded);

    const existingToken = await this.tokenModel.findOne({
      user: new Types.ObjectId(userId),
      tokenType: TokenType.VERIFY_TOKEN,
    });

    if (!existingToken)
      throw new AppException({ message: 'Verify Token does not exist', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verify',
      });

    const tokenCompare = await bcryptjs.compare(verifyInputDto.verifyToken, existingToken.tokenHash);

    if (!tokenCompare) {
      throw new AppException({ message: 'Invalid Verify Token', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verify',
      });
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(userId, { verified: true }, { new: true });

    if (!updatedUser)
      throw new AppException({ message: 'User not found', error: {} }, HttpStatus.BAD_REQUEST, {
        cause: {},
        description: 'verify',
      });

    await this.tokenModel.deleteOne({ _id: existingToken._id });

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
