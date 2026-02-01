import { useState } from 'react'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'
import { useToast } from '../../hooks/useToast'

interface Attachment {
  name: string
  path: string
  size: number
}

interface EmailComposerProps {
  defaultTo?: string
  defaultSubject?: string
  defaultBody?: string
  attachments?: Attachment[]
  onClose?: () => void
  onSend?: (email: EmailData) => void
}

interface EmailData {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  attachments: Attachment[]
  signature: boolean
}

export function EmailComposer({
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  attachments: initialAttachments = [],
  onClose,
  onSend,
}: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments)
  const [includeSignature, setIncludeSignature] = useState(true)
  const [showCcBcc, setShowCcBcc] = useState(false)

  const lawyerProfile = useLawyerProfileStore()
  const toast = useToast()

  const generateSignature = () => {
    const lines = []
    lines.push('')
    lines.push('--')
    if (lawyerProfile.getFullName()) {
      lines.push(lawyerProfile.getFullName())
    }
    if (lawyerProfile.cabinet) {
      lines.push(lawyerProfile.cabinet)
    }
    if (lawyerProfile.barreau) {
      lines.push(`Avocat au Barreau de ${lawyerProfile.barreau}`)
    }
    if (lawyerProfile.telephone) {
      lines.push(`Tél. : ${lawyerProfile.telephone}`)
    }
    if (lawyerProfile.email) {
      lines.push(lawyerProfile.email)
    }
    return lines.join('\n')
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSendViaMailto = () => {
    // Construire l'URL mailto
    const params = new URLSearchParams()

    if (cc) params.append('cc', cc)
    if (bcc) params.append('bcc', bcc)
    params.append('subject', subject)

    let fullBody = body
    if (includeSignature) {
      fullBody += generateSignature()
    }
    params.append('body', fullBody)

    const mailtoUrl = `mailto:${encodeURIComponent(to)}?${params.toString()}`

    // Ouvrir le client mail par défaut
    window.open(mailtoUrl, '_blank')

    toast.success('Ouverture du client mail...')

    if (onSend) {
      onSend({
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        body: fullBody,
        attachments,
        signature: includeSignature,
      })
    }
  }

  const handleCopyToClipboard = async () => {
    let fullBody = body
    if (includeSignature) {
      fullBody += generateSignature()
    }

    const emailText = `À : ${to}
${cc ? `Cc : ${cc}\n` : ''}${bcc ? `Cci : ${bcc}\n` : ''}Objet : ${subject}

${fullBody}`

    try {
      await navigator.clipboard.writeText(emailText)
      toast.success('Email copié dans le presse-papier')
    } catch {
      toast.error('Erreur lors de la copie')
    }
  }

  const isValid = to && subject && body

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Nouveau message</h2>
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

      {/* Formulaire */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Destinataire */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">À</label>
            <button
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {showCcBcc ? 'Masquer Cc/Cci' : 'Afficher Cc/Cci'}
            </button>
          </div>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinataire@example.com"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cc et Cci */}
        {showCcBcc && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Cc</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="copie@example.com"
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cci</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="copie-cachee@example.com"
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Objet */}
        <div>
          <label className="block text-sm font-medium mb-1">Objet</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet du message"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Corps du message */}
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Votre message..."
            rows={10}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          />
        </div>

        {/* Signature */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSignature}
            onChange={(e) => setIncludeSignature(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Inclure la signature du cabinet</span>
        </label>

        {includeSignature && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {generateSignature()}
          </div>
        )}

        {/* Pièces jointes */}
        {attachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Pièces jointes</label>
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note : Les pièces jointes devront être ajoutées manuellement dans votre client mail.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-[var(--border-color)] flex gap-3">
        <button
          onClick={handleCopyToClipboard}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copier
        </button>
        <button
          onClick={handleSendViaMailto}
          disabled={!isValid}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Ouvrir dans le client mail
        </button>
      </div>
    </div>
  )
}
