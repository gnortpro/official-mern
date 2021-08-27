import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";

import { Post } from "../entities/Post";
import { CreatePostInput, UpdatePostInput } from "../types/PostInput";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { checkAuth } from "../middleware/checkAuth";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") createPostInput: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const { title, content } = createPostInput;

      const newPost = await Post.create({
        title,
        content,
      });

      await Post.save(newPost);

      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: newPost,
      };
    } catch (err) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${err.message}`,
      };
    }
  }

  @Query((_return) => [Post], { nullable: true })
  async posts(): Promise<Post[] | null> {
    try {
      return Post.find();
    } catch (err) {
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id") id: number): Promise<Post | undefined> {
    try {
      const findPost = Post.findOne(id);
      return findPost;
    } catch (err) {
      return undefined;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { id, title, content }: UpdatePostInput
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne(id);
    if (!existingPost) {
      return {
        code: 400,
        success: false,
        message: "Post not found",
      };
    }

    existingPost.title = title;
    existingPost.content = content;

    await Post.save(existingPost);

    return {
      code: 200,
      success: true,
      message: "Post updated successfully",
      post: existingPost,
    };
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(@Arg("id") id: number): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne(id);
    if (!existingPost) {
      return {
        code: 400,
        success: false,
        message: "Post not found",
      };
    }

    await Post.delete(id);

    return {
      code: 200,
      success: true,
      message: "Post deleted successfully",
    };
  }
}
