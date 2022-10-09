const { Post, Record } = require("../models");
const { Like } = require("../models");
const { Hashtag } = require("../models");

const help = require("korean-regexp");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const test = require("../node-mailer");

class PostRepository {
  emailService = new test();
  //content,time,distance,path,image,hashtag,userId,nickname,profile등을 받아 게시글을 생성하는 함수
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
    const createPost = await Post.create({
      content,
      time,
      distance,
      path,
      prevImage,
      hashtag,
      userId,
      nickname,
      profile,
      pace,
    });
    return createPost;
  };
  //페이지넘버를 받아 오프셋을 기준으로 5개씩 최신순으로 게시글을 리턴하는 함수
  getAllPosts = async (pagenum) => {
    let offset = 0;
    if (pagenum > 1) {
      offset = 5 * (pagenum - 1);
    }
    const getAllPosts = await Post.findAll({
      offset: offset,
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    return getAllPosts;
  };
  //페이지넘버를 받아 오프셋을 기준으로 5개씩 좋아요순으로 게시글을 리턴하는 함수
  getLikeAllPosts = async (pagenum) => {
    let offset = 0;
    if (pagenum > 1) {
      offset = 5 * (pagenum - 1);
    }
    const getLikeAllPosts = await Post.findAll({
      offset: offset,
      limit: 5,
      order: [
        ["like", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return getLikeAllPosts;
  };
  //해쉬태그와 페이지넘버를 받아 해당 해쉬태그가 존재하는 게시글을 최신순으로 5개씩 리턴하는 함수
  searchPost = async (hashtag, pagenum) => {
    let offset = 0;
    if (pagenum > 1) {
      offset = 5 * (pagenum - 1);
    }
    let arrayId = [];

    const autoSearchPost = await Hashtag.findAll({
      where: {
        hashtag: { [Op.like]: hashtag + "%" },
      },
    });

    for (let i = 0; i < autoSearchPost.length; i++) {
      arrayId.push(autoSearchPost[i].postId);
    }

    const searchPost = await Post.findAll({
      offset: offset,
      limit: 5,
      order: [["createdAt", "DESC"]],
      where: {
        postId: { [Op.in]: arrayId },
      },
    });
    return searchPost;
  };
  //포스트아이디를 받아 게시글을 상세 내용을 리턴하는 함수
  getPost = async (postId, userId) => {
    let isLike;

    if (userId) {
      isLike = await Like.findOne({ where: { userId, postId } });
      if (isLike) {
        await Post.update({ likeDone: true }, { where: { postId } });
      } else {
        await Post.update({ likeDone: false }, { where: { postId } });
      }
    }

    const getPost = await Post.findOne({
      where: { postId },
    });
    console.log(getPost.image);
    return getPost;
  };
  //업데이트할 Column을 받아 수정하는 함수
  updatePost = async (
    postId,
    content,
    newImage, // 추가할 이미지
    prevImage, // 수정된 이미지
    hashtag,
    checkHash
  ) => {
    if (checkHash === false) {
      await Hashtag.destroy({ where: { postId } });
      const consonant = [];

      for (let i = 0; i < hashtag.length; i++) {
        consonant[i] = help.explode(hashtag[i]).join("");
        await Hashtag.create({
          hashtag: hashtag[i],
          consonant: consonant[i],
          postId: postId,
        });
      }
    }

    let prevArr = [];
    prevArr = prevImage; // prev에 있던 이미지들
    for (let i = 0; i < newImage.length; i++) {
      prevArr.push(newImage[i]);
    }
    await Post.update({ prevImage: prevArr }, { where: { postId } });

    const updatePost = await Post.update(
      { content, hashtag },
      { where: { postId } }
    );
    return { 프리브이미지: prevImage, 뉴이미지: newImage };
  };
  //포스트아이디를 받아 게시글을 삭제하는 함수
  deletePost = async (postId) => {
    const deletePost = await Post.destroy({ where: { postId } });

    return deletePost;
  };

  //해쉬태그와 페이지넘버를 받아 해당 해쉬태그가 존재하는 게시글을 좋아요순으로 5개씩 리턴하는 함수
  searchLikePost = async (hashtag, pagenum) => {
    let offset = 0;
    if (pagenum > 1) {
      offset = 5 * (pagenum - 1);
    }
    let arrayId = [];

    const autoSearchPost = await Hashtag.findAll({
      where: {
        hashtag: { [Op.like]: hashtag + "%" },
      },
    });

    for (let i = 0; i < autoSearchPost.length; i++) {
      arrayId.push(autoSearchPost[i].postId);
    }

    const searchPost = await Post.findAll({
      offset: offset,
      limit: 5,
      order: [
        ["like", "DESC"],
        ["createdAt", "DESC"],
      ],
      where: {
        postId: { [Op.in]: arrayId },
      },
    });
    return searchPost;
  };
  //유저가 검색창에 입력할때마다 존재하는 해쉬태그를 자동완성하여 해쉬태그를 리턴하는 함수
  //ex) 해쉬태그가 "새벽런닝"이면 유저가 새벽까지만 검색해도 "새벽런닝"이 리턴된다.
  autoCompletePost = async (hashtag) => {
    hashtag = help.explode(hashtag).join("");

    const autoCompletePost = await Hashtag.findAll({
      where: {
        consonant: { [Op.like]: hashtag + "%" },
      },
    });

    const returnData = autoCompletePost.map((el) => el.hashtag);
    const Data = [...new Set(returnData)];
    return Data;
  };
  getImage = async (postId) => {
    const getImage = await Post.findOne({ where: { postId } });
    const images = getImage.prevImage;

    return images;
  };
}
module.exports = PostRepository;
