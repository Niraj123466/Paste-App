import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

function ViewPaste() {
  const {pasteId} = useParams()
  const allPastes = useSelector(state => state.paste.pastes)
  console.log("all pastes",allPastes)
  const paste = allPastes.filter((item) => item._id === pasteId)[0]

  return (
    <div>
      <div>
      <input type='text' value={paste.title} disabled/>
      </div>
      <div>
      <textarea value={paste.content} disabled/>
      <button onClick={() => {
          navigator.clipboard.writeText(paste.content)
          toast.success("Copied to clipboard")
        }}>Copy</button>
      </div>
    </div>
  )
}

export default ViewPaste
