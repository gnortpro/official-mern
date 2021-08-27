import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { User } from "../entities/User";
import { RegisterInput } from "../types/UserRegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";

@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const validator = validateRegisterInput(registerInput);
    if (validator !== null) return { code: 400, success: false, ...validator };

    try {
      const { username, email, password } = registerInput;

      const existingUser = await User.findOne({
        where: [{ email }, { username }],
      });

      if (existingUser)
        return {
          code: 400,
          success: false,
          message: `Duplicated ${
            existingUser.username === username ? "username" : "email"
          }`,
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: `${
                existingUser.username === username ? "Username" : "Email"
              } already taken`,
            },
          ],
        };

      const hasPassword = await argon2.hash(password);

      let newUser = await User.create({
        email,
        username,
        password: hasPassword,
      });

      newUser = await User.save(newUser);

      req.session.userId = newUser.id;

      return {
        code: 200,
        success: true,
        message: "User registered successfully",
        user: newUser,
      };
    } catch (err) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${err.message}`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const checkEmailOrUser = usernameOrEmail.includes("@");
      const existingUser = await User.findOne(
        checkEmailOrUser
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );

      if (!existingUser)
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: `${checkEmailOrUser ? "Email" : "Username"} incorrect`,
            },
          ],
        };

      const passwordValid = await argon2.verify(
        existingUser.password,
        password
      );

      if (!passwordValid)
        return {
          code: 400,
          success: false,
          message: "Wrong password",
          errors: [{ field: "password", message: "Wrong password" }],
        };

      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        user: existingUser,
        message: "Login successfully",
      };
    } catch (err) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${err.message}`,
      };
    }
  }

  @Mutation((_return) => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise<boolean>((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
