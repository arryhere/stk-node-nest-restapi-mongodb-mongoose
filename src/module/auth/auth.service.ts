import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcryptjs from 'bcryptjs';
import { Model } from 'mongoose';

import { AppException } from '../../lib/appException.lib.js';
import { AppResponse } from '../../lib/appResponse.lib.js';
import { EmailService } from '../../lib/emailService.lib.js';
import { TokenModel, TokenType } from '../../model/token.model.js';
import { UserModel } from '../../model/user.model.js';
import { AuthJwtService } from './authJwt.service.js';
import { DTO_SignupInput } from './dto/signup.input.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    @InjectModel(TokenModel.name) private tokenModel: Model<TokenModel>,

    private readonly authJwtService: AuthJwtService
  ) {}

  async signup(signupInput: DTO_SignupInput): Promise<AppResponse> {
    const emailExist = await this.userModel.findOne({ email: signupInput.email });
    if (emailExist) throw new AppException({ message: 'Email already exist', error: {} }, HttpStatus.BAD_REQUEST);

    const phoneExist = await this.userModel.findOne({ phoneNumber: signupInput.phoneNumber });
    if (phoneExist) throw new AppException({ message: 'Phone number already exist', error: {} }, HttpStatus.BAD_REQUEST);

    const passwordHash = await bcryptjs.hash(signupInput.password, 10);

    const newUser = await this.userModel.create({
      firstName: signupInput.firstName,
      lastName: signupInput.lastName,
      email: signupInput.email,
      passwordHash: passwordHash,
      dob: signupInput.dob,
      phoneNumber: signupInput.phoneNumber,
    });

    const verifyToken = await this.authJwtService.encodeVerifyToken({ id: newUser.id });

    await this.tokenModel.create({ user: newUser._id, token: verifyToken, tokenType: TokenType.VERIFY_TOKEN });

    await EmailService.sendEmail('User Verification Link', `token: ${verifyToken}`, signupInput.email);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'signup success, proceed to verification',
      data: {},
    };
  }
}
