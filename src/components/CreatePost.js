import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createPost } from "../graphql/mutations";

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

  //Create input object when submitting the form
  handleAddPost = async (event) => {
    event.preventDefault();
    const input = {
      postOwnerId: "orchie123", //this.state.postOwnerId,
      postOwnerUsername: "orchie", //this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createdAt: new Date().toISOString(),
    };

    //Pass the input and the createPost mutation to graphQL API
    await API.graphql(graphqlOperation(createPost, { input }));

    //Clear everything up
    this.setState({ postTitle: "", postBody: "" });
  };

  //Put each input value into an array
  handleChangePost = (event) =>
    this.setState({
      [event.target.name]: event.target.value,
    });

  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          style={{ font: "19px" }}
          type="text"
          placeholder="Title"
          name="postTitle"
          required
          value={this.state.postTitle}
          onChange={this.handleChangePost}
        />
        <textarea
          type="text"
          name="postBody"
          rows="3"
          cols="40"
          required
          placeholder="New Blog Post"
          value={this.state.postBody}
          onChange={this.handleChangePost}
        />
        <input type="submit" className="btn" style={{ fontSize: "19px" }} />
      </form>
    );
  }
}

export default CreatePost;
