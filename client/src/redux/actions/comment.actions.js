import * as types from "../constants/post.constants";
import api from "../api";


const create = (body, postId) => async (dispatch) => {
  try {
    const res = await api.post(`/posts/${postId}/comments`, { body });

    dispatch({
      type: types.CREATE_COMMENT_SUCCESS,
      payload: res.data.data.post,
    });
  } catch (error) {
    // dispatch({ type: types.GET_SINGLE_POST_REQUEST_FAILURE, payload: error });
  }
}

export const commentActions = {
  create,
};
