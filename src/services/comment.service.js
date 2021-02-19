
import Comment from '../models/comment';

export const createComment = async (req) => {
    const { parentObject, userId, commentText  } = req.body;

    let comment = new Comment({
        parentObject,
        user: userId,
        text: commentText
    })

    return await comment.save();
}



