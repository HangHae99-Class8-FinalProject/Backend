const postRepository = require("../repositories/posts.repository");
const { Hashtag } = require("../models");
const log = require("../winston");
let BadRequestError = require("./http-errors").BadRequestError;
const help = require("korean-regexp");
class PostService {
  postRepository = new postRepository();
  createPost = async (
    content,
    time,
    distance,
    path,
    prevImage,
    hashtag,
    userId,
    nickname,
    profile,
    pace
  ) => {
    if (!content) {
      log.error("PostController.createPost : content is required");
      throw new BadRequestError(
        "PostController.createPost : content is required"
      );
    }

    const createPost = await this.postRepository.createPost(
      content,
      time,
      distance,
      path,
      prevImage,
      hashtag,
      userId,
      nickname,
      profile,
      pace
    );
    if (hashtag) {
      let consonant = [];
      //유저가 Hashtag를 입력했을 때 Hashtag table에 Hashtag를 생성
      for (let i = 0; i < hashtag.length; i++) {
        consonant[i] = help.explode(hashtag[i]).join("");
        await Hashtag.create({
          hashtag: hashtag[i],
          consonant: consonant[i],
          postId: createPost.postId,
        });
      }
    }
    return createPost;
  };

  getAllPosts = async (pagenum, userId) => {
    if (!pagenum) {
      log.error("PostController.getAllPosts : pagenum is required");
      throw new BadRequestError(
        "PostController.getAllPosts : pagenum is required"
      );
    }
    const getAllPosts = await this.postRepository.getAllPosts(pagenum);

    return Promise.all(
      getAllPosts.map(async (post) => {
        const getPosts = await this.postRepository.getPost(post.postId, userId);

        return getPosts;
      })
    );
  };

  getPost = async (postId, userId) => {
    if (!postId) {
      log.error("PostController.getPost : postId is required");
      throw new BadRequestError("PostController.getPost : postId is required");
    }
    const getPost = await this.postRepository.getPost(postId, userId);

    return getPost;
  };
  updatePost = async (postId, content, newImage, prevImage, hashtag) => {
    let arrayHash = [];
    let checkHash = false;
    const checkSameHashTag = await Hashtag.findAll({
      where: { postId },
      attributes: ["hashtag"],
    });

    //유저가 게시글을 수정할 때 hashtag를 수정하면 Hashtag 테이블의 hashtag도 같이 수정
    for (let i = 0; i < checkSameHashTag.length; i++) {
      arrayHash.push(checkSameHashTag[i].hashtag);
    }
    if (hashtag) {
      if (hashtag.join("") === arrayHash.join("")) {
        checkHash = true;
      }
    } else {
      checkHash = false;
    }
    if (!postId) {
      log.error("PostController.updatePost : postId is required");
      throw new BadRequestError(
        "PostController.updatePost : update is required"
      );
    }
    const updatePost = await this.postRepository.updatePost(
      postId,
      content,
      newImage,
      prevImage,
      hashtag,
      checkHash
    );
    return updatePost;
  };
  deletePost = async (postId) => {
    if (!postId) {
      log.error("PostController.deletePost : postId is required");
      throw new BadRequestError(
        "PostController.deletePost : update is required"
      );
    }
    const deletePost = await this.postRepository.deletePost(postId);
    return deletePost;
  };

  geLikeAllPosts = async (pagenum, userId) => {
    if (!pagenum) {
      log.error("PostController.getLikeAllPosts : pagenum is required");
      throw new BadRequestError(
        "PostController.getLikeAllPosts : pagenum is required"
      );
    }
    const getLikeAllPosts = await this.postRepository.getLikeAllPosts(pagenum);

    return Promise.all(
      getLikeAllPosts.map(async (post) => {
        const getPosts = await this.postRepository.getPost(post.postId, userId);

        return getPosts;
      })
    );
  };
  searchPost = async (hashtag, pagenum, userId) => {
    if (!hashtag) {
      log.error("PostController.searchPost : hashtag is required");
      throw new BadRequestError(
        "PostController.searchPost : hashtag is required"
      );
    }
    const searchPost = await this.postRepository.searchPost(hashtag, pagenum);
    return Promise.all(
      searchPost.map(async (post) => {
        const getPosts = await this.postRepository.getPost(post.postId, userId);

        return getPosts;
      })
    );
  };

  searchLikePost = async (hashtag, pagenum, userId) => {
    if (!hashtag) {
      log.error("PostController.searchLikePost : hashtag is required");
      throw new BadRequestError(
        "PostController.searchLikePost : hashtag is required"
      );
    }
    const searchLikePost = await this.postRepository.searchLikePost(
      hashtag,
      pagenum
    );
    return Promise.all(
      searchLikePost.map(async (post) => {
        const getPosts = await this.postRepository.getPost(post.postId, userId);

        return getPosts;
      })
    );
  };
  autoCompletePost = async (hashtag) => {
    if (!hashtag) {
      log.error("PostController.autoSearchPost : hashtag is required");
      throw new BadRequestError(
        "PostController.autoSearchPost : hashtag is required"
      );
    }
    const autoCompletePost = await this.postRepository.autoCompletePost(
      hashtag
    );
    return autoCompletePost;
  };
  getImage = async (postId) => {
    if (!postId) {
      log.error("PostController.getImage : postId is required");
      throw new BadRequestError("PostController.getImage : postId is required");
    }

    const getImage = await this.postRepository.getImage(postId);
    return getImage;
  };
}
module.exports = PostService;
