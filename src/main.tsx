import ReactDOM from "react-dom"
import './index.css';
import App from "./App"
// downgrading to react 17 because react-mde and react-split libraries isn't supported in react 18
ReactDOM.render(<App />, document.getElementById("root"))

//react 18
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
