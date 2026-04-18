import { RoleEnum } from '../model/user.model.js';

export class CurrentUserType {
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

// export type CurrentUserType = {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   dob: string;
//   phoneNumber: string;
//   verified: boolean;
//   active: boolean;
//   role: RoleEnum;
// };
