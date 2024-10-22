import { useState, useEffect, HtmlHTMLAttributes } from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
// import { data } from "./data"
import Split from "react-split"
// import {nanoid} from "nanoid" 
import { NoteType } from "./utility/types"
import { 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc,
  setDoc
} from "firebase/firestore"
import { notesCollection, db } from "./backend/firebase"
import CreateNote from "./components/CreateNote"

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

function saveToLocalStorage(notesObj: NoteType[]) {
  localStorage.setItem("notes", JSON.stringify(notesObj))
}

export default function App() {
  //lazy initialize: make the state into a callback so it will only render once and wont re render when there is change in the component (check example 2)
  //this is usefull when we are loading that takes up a lot of work to do such as getting local storage or data from api
  //const [notes, setNotes] = useState<NoteType[]>(() => loadFromStorage() || [])
  const [notes, setNotes] = useState<NoteType[]>([]) // we are now grabbing the data in firebase
  
  const [currentNoteId, setCurrentNoteId] = useState(
      (notes[0]?.id) || "")

  //lazy load: example 2
  //it wont console.log every change in the component because we all know that react will re render every component when there is a change unless we use hooks like useMemo to handle a heavy task
  const [state, setState] = useState(() => console.log("State initialization")) 
  const [showCreateNote, setShowCreateNote] = useState(false);

  useEffect(() => {
    //onSnapshot() listen some changes in the firestore database and act accordingly in our local code
    //if the request is a success like example deleting data or adding data, it will run and update our local data, if there is a failure then it wont run
    // onSnapshot() has 2 parameters, 1st: the data we want to listen, 2nd: a callback func that runs when there is a change in the data we are listening
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {  //receives snapshot of the data at the time this callback is called
      // Sync up our local notes array with the snapshot data
      const notesArr = snapshot.docs.map(doc => { // accessing the data in docs and mapping
        return {
          ...doc.data() as NoteType, //firebase might return a different type of data
          id: doc.id // docs has its own id so we are using it, therefore we wont need nanoid()
        }
      })
      setNotes(notesArr)
    })
    setTimeout(() => {
      setShowCreateNote(true);
    }, 2000);
    return unsubscribe; //stops from listening in the database so it wont keep running when the component is unmounted or closing the tab
    //no longer using localStorage 
    // saveToLocalStorage(notes)
    // if(!notes.length) {
    //   console.error("notes empty");
    //   return
    // }
  }, [])

  async function createNewNote() {
    try {
      const newNote: Partial<NoteType> = {
        // id: nanoid(),
        body: "# Type your markdown note's title here",
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
  
  async function updateNote(text: string) {
    const docRef = doc(db, "notes", currentNoteId)
    await setDoc(
      docRef, 
      { body: text, 
        updatedAt: Date.now()
      }, 
      { merge: true }
    )

    // bumps the recent note at the top
    // setNotes(oldNotes => {
    //   const newNotes: NoteType[] = [] // create new notes
    //   oldNotes.map((note, index) => { // maps the note
    //     if(note.id === currentNoteId) { // check if it matches the current note
    //       newNotes.unshift({ ...oldNotes[index], body: text }) //adds the new/edited note to the top of the arr
    //     } else {
    //       newNotes.push(note) // if its not the edited note, adds to the last array
    //     }
    //   })
    //   return newNotes;
    // })

    //doesnt bump the recent note at the top
    // setNotes(oldNotes => 
    // oldNotes.map((oldNote) => {
    // return oldNote.id === currentNoteId
    //   ? { ...oldNote, body: text }
    //   : oldNote
    // }))
  }

  async function deleteNote(noteId: string) {
    try {
      // doc() helps us access to a single document
      const docRef = doc(db, "notes", noteId) // has 3 params, 1st: instance of db that we created in our firebase file, 2nd: name of our collection, 3rd: note id
      await deleteDoc(docRef) // deleteDoc return a promise
    } catch {
      throw new Error('error deleting the note')
    }
    
    
    // a better approach when removing the selected note
    // setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId));

    // removes the note selected
    // setNotes((oldNotes) => {
    //   const newNotes = [...oldNotes];
    //   newNotes.splice(index, 1);
    //   return newNotes
    // })
  }

  // const sortedNotes: NoteType[] = notes.sort((a, b) => b.updatedAt - a.updatedAt)
  // console.log(sortedNotes)

  const currentNote: NoteType = notes.find(note => {
    return note.id === currentNoteId
  }) || notes[0]

  function renderCreateNote() {
    if (showCreateNote) {
      return (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button 
            className="first-note" 
            onClick={createNewNote}
          >
            Create one now
          </button>
        </div>
      );
    }
    return null; // Until the message is ready, return nothing (null)
  }
  
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
          currentNoteId && notes.length > 0 ?
          // notes.length > 0 &&
          <Editor 
            currentNote={currentNote} // replacing findCurrentNote() so it wont keep calling the fn because currentNote is already set with setCurrentNoteId()
            updateNote={updateNote} 
          /> : <CreateNote />
        }
      </Split>
      : renderCreateNote()
    }
    </main>
  )
}
