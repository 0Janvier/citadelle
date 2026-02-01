import { useRef, useState, useEffect } from 'react'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'

interface SignatureEditorProps {
  onSave?: (signatureBase64: string) => void
  onClose?: () => void
}

export function SignatureEditor({ onSave, onClose }: SignatureEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [mode, setMode] = useState<'draw' | 'upload' | 'text'>('draw')
  const [textSignature, setTextSignature] = useState('')
  const [textFont, setTextFont] = useState('Dancing Script')

  const { signature, setSignature } = useLawyerProfileStore()

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fond blanc
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Si une signature existe déjà, la charger
    if (signature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setHasDrawn(true)
      }
      img.src = signature
    }
  }, [signature])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        // Effacer le canvas
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Calculer les dimensions pour centrer l'image
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height)
        const newWidth = img.width * ratio * 0.8
        const newHeight = img.height * ratio * 0.8
        const x = (canvas.width - newWidth) / 2
        const y = (canvas.height - newHeight) / 2

        ctx.drawImage(img, x, y, newWidth, newHeight)
        setHasDrawn(true)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const generateTextSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas || !textSignature) return

    // Effacer le canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Configurer le texte
    ctx.font = `48px "${textFont}", cursive`
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Dessiner le texte
    ctx.fillText(textSignature, canvas.width / 2, canvas.height / 2)
    setHasDrawn(true)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureBase64 = canvas.toDataURL('image/png')
    setSignature(signatureBase64)
    onSave?.(signatureBase64)
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Signature électronique</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modes */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex gap-2">
          {(['draw', 'upload', 'text'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                mode === m
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {m === 'draw' ? 'Dessiner' : m === 'upload' ? 'Importer' : 'Texte'}
            </button>
          ))}
        </div>
      </div>

      {/* Zone de signature */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        {mode === 'draw' && (
          <div className="w-full max-w-lg">
            <p className="text-sm text-gray-500 mb-2 text-center">
              Dessinez votre signature ci-dessous
            </p>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        )}

        {mode === 'upload' && (
          <div className="w-full max-w-lg">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">Cliquez pour importer une image de signature</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="hidden"
            />
          </div>
        )}

        {mode === 'text' && (
          <div className="w-full max-w-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Texte de la signature</label>
              <input
                type="text"
                value={textSignature}
                onChange={(e) => setTextSignature(e.target.value)}
                placeholder="Votre nom"
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Police</label>
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="Dancing Script">Dancing Script</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Pacifico">Pacifico</option>
                <option value="Allura">Allura</option>
                <option value="Sacramento">Sacramento</option>
              </select>
            </div>
            <button
              onClick={generateTextSignature}
              disabled={!textSignature}
              className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Générer
            </button>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full border rounded-lg bg-white"
            />
          </div>
        )}
      </div>

      {/* Aperçu et actions */}
      {hasDrawn && (
        <div className="p-4 border-t border-[var(--border-color)]">
          <p className="text-sm text-gray-500 mb-2">Aperçu de la signature :</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center mb-4">
            {canvasRef.current && (
              <img
                src={canvasRef.current.toDataURL()}
                alt="Signature"
                className="max-h-20 mx-auto"
              />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-[var(--border-color)] flex gap-3">
        <button
          onClick={clearCanvas}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Effacer
        </button>
        <button
          onClick={handleSave}
          disabled={!hasDrawn}
          className="flex-1 px-4 py-2 bg-[var(--status-success)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}
