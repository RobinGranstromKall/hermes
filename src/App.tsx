import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import {Club, generateRoundRobin, TeamTypes} from "./models/Club";

function App() {
  const [count, setCount] = useState(0)
  const testClubs = [
    new Club({name: "Banan", teamTypes: [TeamTypes.Women, TeamTypes.Men, TeamTypes.Mixed]}),
    new Club({name: "Melon", teamTypes: [TeamTypes.Women, TeamTypes.Men] }),
    new Club({name: "Kiwi", teamTypes: [TeamTypes.Women,  TeamTypes.Mixed]}),
    new Club({name: "Citron", teamTypes: [TeamTypes.Women, TeamTypes.Men, TeamTypes.Mixed]}),
  ]
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => generateRoundRobin(testClubs, 3)}>
          Click me
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
