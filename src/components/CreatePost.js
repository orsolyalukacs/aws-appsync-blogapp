import React, { Component } from "react";

class CreatePost extends Component {
  state = {
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: "",
  };

  componentDidMount = async () => {
    //TODO: TBA
  };

  handleAddPost = async event => {
    event.preventDefault();
    const input = {
        postOwnerId: this.state.postOwnerId,
        postOwnerUsername: this.state.postOwnerUsername,
        postTitle: this.state.postTitle,
        postBody: this.state.postBody,
        createdAt: new Date().toISOString()
    }
  }

  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          style={{ font: "19px" }}
          type="text"
          placeholder="Title"
          name="postTitle"
          required
        />
        <textarea
          type="text"
          name="postBody"
          rows="3"
          cols="40"
          required
          placeholder="New Blog Post"
        />
        <input type="submit" className="btn" style={{ fontSize: "19px" }} />
      </form>
    );
  }
}

export default CreatePost;
