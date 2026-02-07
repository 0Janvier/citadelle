// Panneau latéral pour les fonctionnalités avancées
import { usePanelStore } from '../store/usePanelStore'
import { ClauseLibrary } from './clauses/ClauseLibrary'
import { VariablePanel } from './variables/VariablePanel'
import { CodeBrowser } from './codes/CodeBrowser'
import { SignatureEditor } from './signature/SignatureEditor'
import { OcrPanel } from './ocr/OcrPanel'
import { CloudSyncPanel } from './cloud/CloudSyncPanel'

export function SidePanel() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const closePanel = usePanelStore((state) => state.closePanel)

  // Ces panneaux sont gérés différemment (modaux ou avec des props spécifiques)
  const excludedPanels = ['search', 'comments', 'email', 'diff']

  if (!activePanel || excludedPanels.includes(activePanel)) return null

  const renderPanel = () => {
    switch (activePanel) {
      case 'clauses':
        return <ClauseLibrary onClose={closePanel} />
      case 'variables':
        return <VariablePanel onClose={closePanel} />
      case 'codes':
        return <CodeBrowser onClose={closePanel} />
      case 'signature':
        return <SignatureEditor onClose={closePanel} />
      case 'ocr':
        return <OcrPanel onClose={closePanel} />
      case 'cloud':
        return <CloudSyncPanel onClose={closePanel} />
      default:
        return null
    }
  }

  return (
    <div className="w-96 border-l border-[var(--border)] bg-[var(--bg)] flex flex-col h-full overflow-hidden">
      {renderPanel()}
    </div>
  )
}
