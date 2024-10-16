import { Dispatch, SetStateAction } from "react"
import { NewNoteType } from "../utility/types"

type SidebarType = {
  notes: NewNoteType[]
  currentNote: NewNoteType
  setCurrentNoteId: Dispatch<SetStateAction<string>>
  newNote: () => void
} 

export default function Sidebar(props: SidebarType) {
  const noteElements = props.notes.map((note) => ( 
    <div key={note.id}>
      <div
        className={`title ${
          note.id === props.currentNote.id ? "selected-note" : ""}`}
        onClick={() => props.setCurrentNoteId(note.id)}
      >
        {/* this will display the title of our note when it finds new line ("\n") */}
        <h4 className="text-snippet">{note.body.split("\n")[0]}</h4>
      </div>
    </div>
  ))

  return (
    <section className="pane sidebar">
      <div className="sidebar--header">
        <h3>Notes</h3>
        <button className="new-note" onClick={props.newNote}>+</button>
      </div>
      {noteElements}
    </section>
  )
}
