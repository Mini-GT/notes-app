import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
// import { data } from "./data"
import Split from "react-split"
import {nanoid} from "nanoid"
import { NewNoteType } from "./utility/types"

function loadFromStorage() {
  const noteData = localStorage.getItem("notes")
  if(!noteData) {
    console.log("no notes found");
    return
  }
  const parsedData = JSON.parse(noteData)
  
  return parsedData;
}

function saveToLocalStorage(notesObj: NewNoteType[]) {
  localStorage.setItem("notes", JSON.stringify(notesObj))
}

export default function App() {
  const notesFromLocalStorage = loadFromStorage()
  const [notes, setNotes] = useState<NewNoteType[]>(notesFromLocalStorage || [])
  const [currentNoteId, setCurrentNoteId] = useState(
      (notes[0] && notes[0].id) || ""
  )
  
  useEffect(() => {
    saveToLocalStorage(notes)
  }, [notes])

  function createNewNote() {
    const newNote: NewNoteType = {
        id: nanoid(),
        body: "# Type your markdown note's title here"
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
    setCurrentNoteId(newNote.id)
  }
  
  function updateNote(text: string) {
    setNotes(oldNotes => oldNotes.map(oldNote => {
    return oldNote.id === currentNoteId
      ? { ...oldNote, body: text }
      : oldNote
    }))
  }
  
  function findCurrentNote() {
    return notes.find(note => {
      return note.id === currentNoteId
    }) || notes[0]
  }
  
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
          currentNote={findCurrentNote()}
          setCurrentNoteId={setCurrentNoteId}
          newNote={createNewNote}
        />
        {
          currentNoteId && 
          notes.length > 0 &&
          <Editor 
            currentNote={findCurrentNote()} 
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
