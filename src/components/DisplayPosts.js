import React, { Component } from "react";
import { listPosts } from "../graphql/queries";
import { Auth, API, graphqlOperation } from "aws-amplify";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import {
  onCreatePost,
  onDeletePost,
  onUpdatePost,
  onCreateComment,
  onCreateLike,
} from "../graphql/subscriptions";
import { createLike } from "../graphql/mutations";
import CreateCommentPost from "./CreateCommentPost";
import CommentPost from "./CommentPost";
import { FaThumbsUp } from "react-icons/fa";

class DisplayPosts extends Component {
  state = {
    posts: [],
    ownerId: "",
    ownerUsername: "",
    isHovering: false,
  };

  //TODO: move subscriptions to componentDidUpdate
  componentDidMount = async () => {
    this.getPosts();

    //Fetch the current user information
    await Auth.currentUserInfo().then((user) => {
      this.setState({
        ownerId: user.attributes.sub,
        ownerUsername: user.username,
      });
    });
    //Subscribe to post creation
    this.createPostListener = API.graphql(
      graphqlOperation(onCreatePost)
    ).subscribe({
      next: (postData) => {
        //Create a copy of the posts array only with the newly created posts
        const newPost = postData.value.data.onCreatePost;
        //Create a post array for previous posts only
        //Make sure in our previous/state post array we don't have the new post
        const prevPosts = this.state.posts.filter(
          (post) => post.id !== newPost.id
        );

        //Concatenate the new and the previous copy of the post array
        const updatedPosts = [newPost, ...prevPosts];
        //Update the posts array
        this.setState({ posts: updatedPosts });
      },
    });

    //Subscribe to post deletions
    this.deletePostListener = API.graphql(
      graphqlOperation(onDeletePost)
    ).subscribe({
      next: (postData) => {
        const deletedPost = postData.value.data.onDeletePost;
        const updatedPosts = this.state.posts.filter(
          (post) => post.id !== deletedPost.id
        );
        this.setState({ posts: updatedPosts });
      },
    });

    //Subscribe to post updates
    this.updatePostListener = API.graphql(
      graphqlOperation(onUpdatePost)
    ).subscribe({
      next: (postData) => {
        const { posts } = this.state;
        const updatePost = postData.value.data.onUpdatePost;
        //Find the post that needs to be updated
        const index = posts.findIndex((post) => post.id === updatePost.id);
        //Create the updated posts
        const updatedPosts = [
          ...posts.slice(0, index),
          updatePost,
          ...posts.slice(index + 1),
        ];
        this.setState({ posts: updatedPosts });
      },
    });

    //Subscribe to comments
    this.createPostCommentListener = API.graphql(
      graphqlOperation(onCreateComment)
    ).subscribe({
      next: (commentData) => {
        const createdComment = commentData.value.data.onCreateComment;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdComment.post.id === post.id) {
            post.comments.items.push(createdComment);
          }
        }
        this.setState({ posts });
      },
    });

    //Subscribe to likes
    this.createPostLikeListener = API.graphql(
      graphqlOperation(onCreateLike)
    ).subscribe({
      next: (postData) => {
        const createdLike = postData.value.data.onCreateLike;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdLike.post.id === post.id) {
            post.likes.items.push(createdLike);
          }
        }
        this.setState({ posts });
      },
    });
  };

  //Unmount the subscription listener
  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
    this.createPostLikeListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    // console.log('All posts: ' + JSON.stringify(result.data.listPosts.items));
    this.setState({ posts: result.data.listPosts.items });
  };

  //Keep track if user has liked a post or not
  likedPost = (postId) => {
    for (let post of this.state.post) {
      if (post.id === postId) {
        if (post.postOwnerId === this.state.ownerId) return true;
        for (let like of post.likes.items) {
          if (like.likeOwnerId === this.state.ownerId);
          return true;
        }
      }
    }
    return false;
  };

  handleLike = async (postId) => {
    const input = {
      numberLikes: 1,
      likeOwnerId: this.state.ownerId,
      likeOwnerUsername: this.state.ownerUsername,
      likePostId: postId,
    };

    try {
      const result = await API.graphql(graphqlOperation(createLike, { input }));

      console.log("liked: ", result.data);
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { posts } = this.state;

    return posts.map((post) => {
      return (
        <div className="posts" style={rowStyle} key={post.id}>
          <h1>{post.postTitle}</h1>
          <span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
            {"Wrote by: "} {post.postOwnerUsername}
            <time style={{ fontStyle: "italic" }}>
              {" "}
              {new Date(post.createdAt).toDateString()}
            </time>
          </span>
          <p>{post.postBody}</p>

          <br />

          <span>
            <DeletePost data={post} />
            <EditPost {...post} />

            <span>
              <p onClick={() => this.handleLike(post.id)}>
                {post.likes.items.length}
                {" "}
                <FaThumbsUp />
              </p>
            </span>
          </span>

          <span>
            <CreateCommentPost postId={post.id} />
            {post.comments.items.length > 0 && (
              <span style={{ fontSize: "19px", color: "gray" }}>
                Comments:{" "}
              </span>
            )}
            {post.comments.items.map((comment, index) => (
              <CommentPost key={index} commentData={comment} />
            ))}
          </span>

          <FaThumbsUp />
        </div>
      );
    });
  }
}

const rowStyle = {
  background: "#f4f4f4",
  padding: "10px",
  border: "1px #ccc dotted",
  margin: "14px",
};
export default DisplayPosts;
