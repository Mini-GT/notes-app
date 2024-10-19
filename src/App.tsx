import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
// import { data } from "./data"
import Split from "react-split"
import {nanoid} from "nanoid"
import { NewNoteType } from "./utility/types"
import { onSnapshot } from "firebase/firestore"
import { notesCollection } from "./backend/firebase"

function loadFromStorage() {
  console.log("will only render once")
  const noteData = localStorage.getItem("notes")
  if(!noteData) {
    console.log("no notes found");
    return
  }
  const parsedData = JSON.parse(noteData)
  return parsedData
}

function saveToLocalStorage(notesObj: NewNoteType[]) {
  localStorage.setItem("notes", JSON.stringify(notesObj))
}

export default function App() {
  //lazy initialize: make the state into a callback so it will only render once and wont re render when there is change in the component (check example 2)
  //this is usefull when we are loading that takes up a lot of work to do such as getting local storage or data from api
  const [notes, setNotes] = useState<NewNoteType[]>(() => loadFromStorage() || [])
  const [currentNoteId, setCurrentNoteId] = useState(
      (notes[0]?.id) || "")

  //lazy load: example 2
  //it wont console.log every change in the component because we all know that react will re render every component when there is a change unless we use hooks like useMemo to handle a heavy task
  const [state, setState] = useState(() => console.log("State initialization")) 


  useEffect(() => {
    //onSnapshot() listens to the firebase if there is a change in data
    //if there is a change, it will run and update our local data
    // onSnapshot() takes 2 arguments, 1st: the data we want to listen, 2nd: a callback func that calls when there is a change in our notesCollection
    onSnapshot(notesCollection, (snapshot) => {

    })

    //no longer uses localStorage
    // saveToLocalStorage(notes)
    // if(!notes.length) {
    //   console.error("notes empty");
    //   return
    // }
  }, [/* notes */])

  function createNewNote() {
    const newNote: NewNoteType = {
        id: nanoid(),
        body: "# Type your markdown note's title here"
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
    setCurrentNoteId(newNote.id)
  }
  
  function updateNote(text: string) {
      // bumps the recent note at the top
      setNotes(oldNotes => {
        const newNotes: NewNoteType[] = [] // create new notes
        oldNotes.map((note, index) => { // maps the note
          if(note.id === currentNoteId) { // check if it matches the current note
            newNotes.unshift({ ...oldNotes[index], body: text }) //adds the new/edited note to the top of the arr
          } else {
            newNotes.push(note) // if its not the edited note, adds to the last array
          }
        })
        return newNotes;
      })

    //doesnt bump the recent note at the top
    // setNotes(oldNotes => 
    // oldNotes.map((oldNote) => {
    // return oldNote.id === currentNoteId
    //   ? { ...oldNote, body: text }
    //   : oldNote
    // }))
  }

  function deleteNote(noteId: string) {
    //a better approach when removing the selected note
    setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId));

    // removes the note selected
    // setNotes((oldNotes) => {
    //   const newNotes = [...oldNotes];
    //   newNotes.splice(index, 1);
    //   return newNotes
    // })
  }

  const currentNote: NewNoteType = notes.find(note => {
    return note.id === currentNoteId
  }) || notes[0]
  
  // function findCurrentNote() {
  //   return notes.find(note => {
  //     return note.id === currentNoteId
  //   }) || notes[0]
  // }
  
  return (
    <main>
    {
      notes.length > 0 
      ?
      <Split 
        sizes={[30, 70]} 
        direction="horizontal" 
        className="split"
      >
        <Sidebar
          notes={notes}
          currentNote={currentNote} // replacing findCurrentNote() so it wont keep calling the fn because currentNote is already set with setCurrentNoteId()
          setCurrentNoteId={setCurrentNoteId}
          newNote={createNewNote}
          deleteNote={deleteNote}
        />
        {
          currentNoteId && 
          notes.length > 0 &&
          <Editor 
            currentNote={currentNote} // replacing findCurrentNote() so it wont keep calling the fn because currentNote is already set with setCurrentNoteId()
            updateNote={updateNote} 
          />
        }
      </Split>
      :
      <div className="no-notes">
        <h1>You have no notes</h1>
        <button 
          className="first-note" 
          onClick={createNewNote}
        >
          Create one now
        </button>
      </div>
    }
    </main>
  )
}
