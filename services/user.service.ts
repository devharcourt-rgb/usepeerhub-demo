import UserRepository from "../repository/user.repository";
import { IUser } from "../types/user.types";
import HTTPException from "../utils/error.utils";
import { HTTPStatus } from "../utils/http.utils";

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: IUser) {
    const user = await this.userRepository.createUser(data);
    return user;
  }

  async findUser(query: Record<string, any>) {
    const user = await this.userRepository.findUser(query);
    return user;
  }

  async find(query: Record<string, any>) {
    const user = await this.userRepository.find(query);
    return user;
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findUserById(id);
    return user;
  }

  async updateUser({
    query,
    update,
  }: {
    query: Record<string, any>;
    update: Partial<IUser>;
  }) {
    const user = await this.userRepository.findUser(query);

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "user account not found");
    }

    return await this.userRepository.updateUser({ query, update });
  }
}

export default UserService;
