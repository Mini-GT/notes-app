import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
// import { data } from "./data"
import Split from "react-split"
import {nanoid} from "nanoid"
import { NewNoteType } from "./utility/types"
import { onSnapshot, addDoc, doc } from "firebase/firestore"
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
  //const [notes, setNotes] = useState<NewNoteType[]>(() => loadFromStorage() || [])
  const [notes, setNotes] = useState<NewNoteType[]>([]) // we are now grabbing the data in firebase

  const [currentNoteId, setCurrentNoteId] = useState(
      (notes[0]?.id) || "")

  //lazy load: example 2
  //it wont console.log every change in the component because we all know that react will re render every component when there is a change unless we use hooks like useMemo to handle a heavy task
  const [state, setState] = useState(() => console.log("State initialization")) 


  useEffect(() => {
    //onSnapshot() listen some changes in the firestore database and act accordingly in our local code
    //if the request is a success like example deleting data or adding data, it will run and update our local data, if there is a failure then it wont run
    // onSnapshot() has 2 parameters, 1st: the data we want to listen, 2nd: a callback func that runs when there is a change in the data we are listening
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {  //receives snapshot of the data at the time this callback is called
      // Sync up our local notes array with the snapshot data
      const notesArr = snapshot.docs.map(doc => { // accessing the data in docs and mapping
        return {
          ...doc.data(), //firebase might return a different type of data
          id: doc.id // docs has its own id so we are using it, therefore we wont need nanoid()
        }
      })
      setNotes(notesArr)
    })
    return unsubscribe; //stops from listening in the database so it wont keep running when the component is unmounted or closing the tab

    //no longer using localStorage 
    // saveToLocalStorage(notes)
    // if(!notes.length) {
    //   console.error("notes empty");
    //   return
    // }
  }, [/* notes */])

  async function createNewNote() {
    try {
      const newNote: Partial<NewNoteType> = {
        // id: nanoid(),
        body: "# Type your markdown note's title here"
      }
      //addDoc will be called to add the data in our firebase. takes 2 params (1st: where we want to push the document, 2nd: our new note obj )
      const newNoteRef = await addDoc(notesCollection, newNote) //addDoc returns a promise and a reference to the doc we created
      setCurrentNoteId(newNoteRef.id)
      console.log(newNoteRef.id)
    } catch {
      throw new Error("Something went wrong");
    }
    // setNotes(prevNotes => [newNote, ...prevNotes])
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
    console.log(note)
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
          currentNoteId && notes.length > 0 &&
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
