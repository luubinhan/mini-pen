import { EditorLayout } from './components/EditorLayout'
import { Header } from './components/Header'

export default function App() {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <EditorLayout />
    </div>
  )
}
