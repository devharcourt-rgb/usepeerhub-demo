import { UserModel } from "../models/user.model";
import { IUser } from "../types/user.types";

class UserRepository {
  constructor() {}

  async createUser(data: IUser) {
    const user = await UserModel.create(data);
    return user;
  }

  async findUser(query: Record<string, any>) {
    const user = await UserModel.findOne(query);
    return user;
  }

  async findUserById(id: string) {
    const user = await UserModel.findById(id);
    return user;
  }

  async find(query: Record<string, any>) {
    const users = await UserModel.find(query);
    return users;
  }

  async updateUser({
    query,
    update,
  }: {
    query: Record<string, any>;
    update: Partial<IUser>;
  }) {
    const user = await UserModel.findOneAndUpdate(query, update);
    return user;
  }
}

export default UserRepository;
