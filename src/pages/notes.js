import React, { useState, useEffect } from "react"
import { API, graphqlOperation } from 'aws-amplify'
import { createNote } from "../graphql/mutations";
import { listNotes } from "../graphql/queries";
import Layout from "../components/layout";
import { Link } from "gatsby";

// Amplify Configuration
import Amplify, { Hub } from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig)

const NotesPage = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", body: "" });

  useEffect(() => {
    let isUnmounted = false;
    Hub.listen("auth", ({ payload: { event, data } }) => {
      if (event === "signIn") {
        !isUnmounted && setIsUserLoggedIn(true);
      }
    })
    return () => {
      isUnmounted = true;
    }
  }, []);

  useEffect(() => {
    fetchTodos()
  }, [isUserLoggedIn])

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const notesData = await API.graphql(graphqlOperation(listNotes))
      const notes = notesData.data.listNotes.items
      setNotes(notes)
      setLoading(false);
    } catch (err) { console.log('error fetching notes') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newNote.title.length || !newNote.body.length) return;
      setNotes([newNote, ...notes]);
      await API.graphql(graphqlOperation(createNote, { input: newNote }));
      setNewNote({ title: "", body: "" });
    } catch (err) {
      console.log('error creating notes');
    }
  }

  return (
    <Layout>
      <AmplifyAuthenticator>
        <div style={{display: 'flex', justifyContent: "space-evenly", alignItems: "center"}}>
          <h1>My Personal Notes</h1>
          <AmplifySignOut />
        </div>
        <form onSubmit={handleSubmit}>
          <p>
            <input
              type="text"
              placeholder="Type title"
              style={{ width: "50%", fontSize: "15px" }}
              value={newNote.title}
              onChange={e => setNewNote({ ...newNote, title: e.target.value })}
            />
          </p>
          <p>
            <textarea
              rows="4"
              placeholder="Type body"
              style={{ width: "70%", fontSize: "15px" }}
              value={newNote.body}
              onChange={e => setNewNote({ ...newNote, body: e.target.value })}
            />
          </p>
          <p>
            <input
              type="submit"
              style={{ width: "30%", height: "30px" }}
              value="Add Note" />
          </p>
        </form>
        <hr />
        {loading ? <h2>Loading...</h2> : <span />}
        {notes.map((note, index) => (
          <div key={index}>
            <h2>{note.title}</h2>
            <p>{note.body}</p>
            <hr />
          </div>
        ))}

      </AmplifyAuthenticator>
    </Layout>
  )
}

export default NotesPage
