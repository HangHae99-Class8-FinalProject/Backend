const { Comment, Post, ReComment } = require("../models");

class CommentRepository {
  //Repo 특정 게시글 postId 조회
  findPostid = async (postId) => {
    return await Post.findOne({ where: { postId } });
  };
  //Repo 특정 게시글에 댓글 작성
  createComment = async (comment, postId, userId, nickname, image) => {
    const createComment = await Comment.create({
      comment,
      postId,
      userId,
      nickname,
      image,
    });
    /*
    댓글 작성될 때 마다 Post 테이블의 commentNum 속성 값 증가 (댓글 갯수)
    */ 
    const increase = await Post.findOne({ where: { postId } });
    const commentNum = increase.commentNum + 1;
    await Post.update({ commentNum }, { where: { postId } });
    return createComment;
  };
  //Repo 특정 게시글의 전체댓글 postId조회
  /*
  조회시 마다 댓글 수를 5개씩 끊어서 보여줌  
  */
  findinPostid = async (postId, pagenum) => {
    let offset = 0;
    if (pagenum > 1) {
      offset = 5 * (pagenum - 1);
    }
    const inPostid = await Comment.findAll({
      where: { postId },
      
      order: [["createdAt", "ASC"]],
      limit: 5,
      offset: offset,
    });
    
    return inPostid;
    
  };

  //Repo 특정 게시글에 댓글 수정
  editComment = async (userId, commentId, comment) => {
    return await Comment.update({ comment }, { where: { userId, commentId } });
  };
  //Repo 특정 게시글에 댓글 삭제
  
  deleteComment = async (userId, commentId) => {
    const getComment = await Comment.findOne({ where: { commentId } });
    const getPostId = getComment.postId;
  /*
  댓글 삭제시 Post 테이블의 commentNum 속상 값 감소
  */
    const getPost = await Post.findOne({ where: { postId: getPostId } });
    const commentNum = getPost.commentNum - 1;
    await Post.update({ commentNum }, { where: { postId: getPostId } });

    return await Comment.destroy({ where: { userId, commentId } });
  };
  //Repo 특정 댓글 조회
  findCommentid = async (commentId) => {
    return await Comment.findOne({ where: { commentId } });
  };
  //Repo 댓글에 대댓글 작성
  createRecomment = async (
    comment,
    commentId,
    recommentId,
    userId,
    nickname,
    image
  ) => {
    const increase = await Comment.findOne({ where: { commentId } });
    const recommentNum = increase.recommentNum + 1;
    await Comment.update({ recommentNum }, { where: { commentId } });

    return await ReComment.create({
      comment,
      commentId,
      recommentId,
      userId,
      nickname,
      image,
    });
  };
  //Repo 특정 댓글의 전체 대댓글 조회
  findinCommentid = async (commentId, pagenum) => {
    let offset = 0;
    if (pagenum > 1) {
      offset = 5 * (pagenum - 1);
    }
    const inRecommentid = await ReComment.findAll({
      where: { commentId },
      
      order: [["createdAt", "ASC"]],
      limit: 5,
      offset: offset,
    });
    

    return inRecommentid;
    
  };
  //Repo 특정 대댓글 조회
  findRecomment = async (recommentId) => {
    return await ReComment.findByPk(recommentId);
  };
  //Repo 특정 대댓글 수정
  editRecomment = async (userId, commentId, recommentId, comment) => {
    return await ReComment.update(
      { comment },
      { where: { userId, commentId, recommentId } }
    );
  };
  //Repo 특정 대댓글 삭제
  deleteRecomment = async (userId, commentId, recommentId) => {
    const decrease = await Comment.findOne({ where: { commentId } });
    const recommentNum = decrease.recommentNum - 1;
    await Comment.update({ recommentNum }, { where: { commentId } });

    return await ReComment.destroy({
      where: { userId, commentId, recommentId },
    });
  };

  
}
module.exports = CommentRepository;
