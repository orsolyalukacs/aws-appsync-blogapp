import React, { Component } from "react";
import { listPosts } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import { onCreatePost, onDeletePost } from "../graphql/subscriptions";

class DisplayPosts extends Component {
  state = {
    posts: [],
  };

  //TODO: move subscriptions to componentDidUpdate
  componentDidMount = async () => {
    this.getPosts();
    //Get all the post data once a new post is created
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
  };

  //Unmount the subscription listener
  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    // console.log('All posts: ' + JSON.stringify(result.data.listPosts.items));
    this.setState({ posts: result.data.listPosts.items });
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
          </span>
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
