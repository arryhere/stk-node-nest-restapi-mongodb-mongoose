import { RoleEnum } from '../model/user.model.js';

export class UserLeanType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  phoneNumber: string;
  verified: boolean;
  active: boolean;
  role: RoleEnum;
}
