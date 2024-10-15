import { useState } from "react";
import ReactMde from "react-mde"
import Showdown from "showdown";
import { NewNoteType } from "../utility/types";

type EditorType = {
  currentNote: NewNoteType
  updateNote: (text: string) => void
}


export default function Editor({ currentNote, updateNote }: EditorType) {
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write")

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  })  

  return (
    <section className="pane editor">
      <ReactMde
        value={currentNote.body}
        onChange={updateNote}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
            Promise.resolve(converter.makeHtml(markdown))
        }
        minEditorHeight={80}
        heightUnits="vh"
      />
    </section>
  )
}
