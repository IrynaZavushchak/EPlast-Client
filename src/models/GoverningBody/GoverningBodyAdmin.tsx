import AdminType from '../Admin/AdminType';
import GoverningBodyUser from './GoverningBodyUser';

export default class GoverningBodyAdmin {
  id: number;
  userId: string;
  user: GoverningBodyUser;
  adminType: AdminType;
  governingBodyId: number;
  startDate?: string;
  endDate?: string;
  workEmail?: string;

  constructor() {
    this.id = 0;
    this.userId = "";
    this.user = new GoverningBodyUser();
    this.adminType = new AdminType();
    this.governingBodyId = 0;
    this.startDate = undefined;
    this.endDate = undefined;
    this.workEmail = undefined;
  }
}
