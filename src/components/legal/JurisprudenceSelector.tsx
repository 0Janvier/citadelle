import { useState, useMemo } from 'react'
import type {
  Jurisprudence,
  JuridictionType,
  SolutionType,
} from '../../types/legal'
import {
  genererCitationCourte,
  genererCitationComplete,
} from '../../types/legal'

interface JurisprudenceSelectorProps {
  jurisprudences: Jurisprudence[]
  onSelect: (jurisprudence: Jurisprudence) => void
  onInsertCitation: (citation: string, format: 'courte' | 'complete') => void
  onAdd?: (jurisprudence: Omit<Jurisprudence, 'id' | 'createdAt' | 'updatedAt' | 'citationCourte' | 'citationComplete'>) => void
}

/**
 * Sélecteur de jurisprudence
 *
 * Permet de :
 * - Rechercher dans une base locale de jurisprudences
 * - Saisir manuellement une nouvelle jurisprudence
 * - Insérer une citation formatée dans l'éditeur
 * - Choisir entre citation courte et complète
 */
export function JurisprudenceSelector({
  jurisprudences,
  onSelect,
  onInsertCitation,
  onAdd,
}: JurisprudenceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [selectedJurisprudence, setSelectedJurisprudence] = useState<Jurisprudence | null>(null)

  // Formulaire nouvelle jurisprudence
  const [newJuris, setNewJuris] = useState<{
    juridiction: JuridictionType
    ville: string
    date: string
    numero: string
    ecli: string
    solution: SolutionType
    resume: string
    matieres: string
  }>({
    juridiction: 'cass_civ_1',
    ville: '',
    date: '',
    numero: '',
    ecli: '',
    solution: 'rejet',
    resume: '',
    matieres: '',
  })

  // Filtrer les jurisprudences
  const filteredJurisprudences = useMemo(() => {
    if (!searchQuery.trim()) return jurisprudences

    const query = searchQuery.toLowerCase()
    return jurisprudences.filter(
      (j) =>
        j.citationCourte.toLowerCase().includes(query) ||
        j.citationComplete.toLowerCase().includes(query) ||
        j.numero?.toLowerCase().includes(query) ||
        j.resume?.toLowerCase().includes(query) ||
        j.matieres.some((m) => m.toLowerCase().includes(query))
    )
  }, [jurisprudences, searchQuery])

  // Générer les citations pour une nouvelle jurisprudence
  const getNewCitations = () => {
    const temp: Jurisprudence = {
      id: 'temp',
      juridiction: newJuris.juridiction,
      ville: newJuris.ville || undefined,
      date: newJuris.date,
      numero: newJuris.numero || undefined,
      ecli: newJuris.ecli || undefined,
      solution: newJuris.solution,
      matieres: newJuris.matieres.split(',').map((m) => m.trim()).filter(Boolean),
      motsClefs: [],
      citationCourte: '',
      citationComplete: '',
      createdAt: '',
      updatedAt: '',
    }

    return {
      courte: genererCitationCourte(temp),
      complete: genererCitationComplete(temp),
    }
  }

  const handleAddJurisprudence = () => {
    if (!onAdd || !newJuris.date) return

    const matieres = newJuris.matieres.split(',').map((m) => m.trim()).filter(Boolean)

    onAdd({
      juridiction: newJuris.juridiction,
      ville: newJuris.ville || undefined,
      date: newJuris.date,
      numero: newJuris.numero || undefined,
      ecli: newJuris.ecli || undefined,
      solution: newJuris.solution,
      resume: newJuris.resume || undefined,
      matieres,
      motsClefs: [],
    })

    // Reset form
    setNewJuris({
      juridiction: 'cass_civ_1',
      ville: '',
      date: '',
      numero: '',
      ecli: '',
      solution: 'rejet',
      resume: '',
      matieres: '',
    })
    setIsAddingNew(false)
  }

  const handleInsertCitation = (format: 'courte' | 'complete') => {
    if (selectedJurisprudence) {
      const citation = format === 'courte'
        ? selectedJurisprudence.citationCourte
        : selectedJurisprudence.citationComplete
      onInsertCitation(citation, format)
    } else if (isAddingNew && newJuris.date) {
      const citations = getNewCitations()
      onInsertCitation(format === 'courte' ? citations.courte : citations.complete, format)
    }
  }

  return (
    <div className="jurisprudence-selector">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Jurisprudence
        </h3>
        {onAdd && (
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            {isAddingNew ? 'Rechercher' : '+ Nouvelle'}
          </button>
        )}
      </div>

      {isAddingNew ? (
        /* Formulaire nouvelle jurisprudence */
        <div className="space-y-4">
          {/* Juridiction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Juridiction *
              </label>
              <select
                value={newJuris.juridiction}
                onChange={(e) => setNewJuris({ ...newJuris, juridiction: e.target.value as JuridictionType })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              >
                <optgroup label="Cour de cassation">
                  <option value="cass_civ_1">1re chambre civile</option>
                  <option value="cass_civ_2">2e chambre civile</option>
                  <option value="cass_civ_3">3e chambre civile</option>
                  <option value="cass_com">Chambre commerciale</option>
                  <option value="cass_soc">Chambre sociale</option>
                  <option value="cass_crim">Chambre criminelle</option>
                  <option value="cass_ass_plen">Assemblée plénière</option>
                  <option value="cass_ch_mixte">Chambre mixte</option>
                </optgroup>
                <optgroup label="Juridictions administratives">
                  <option value="conseil_etat">Conseil d'État</option>
                  <option value="cour_administrative_appel">Cour administrative d'appel</option>
                  <option value="tribunal_administratif">Tribunal administratif</option>
                </optgroup>
                <optgroup label="Autres juridictions">
                  <option value="conseil_const">Conseil constitutionnel</option>
                  <option value="cour_appel">Cour d'appel</option>
                  <option value="tribunal_judiciaire">Tribunal judiciaire</option>
                  <option value="tribunal_commerce">Tribunal de commerce</option>
                  <option value="conseil_prudhommes">Conseil de prud'hommes</option>
                </optgroup>
                <optgroup label="Juridictions européennes">
                  <option value="cjue">CJUE</option>
                  <option value="cedh">CEDH</option>
                </optgroup>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Ville (pour CA, TJ...)
              </label>
              <input
                type="text"
                value={newJuris.ville}
                onChange={(e) => setNewJuris({ ...newJuris, ville: e.target.value })}
                placeholder="Ex: Paris, Lyon..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              />
            </div>
          </div>

          {/* Date et numéro */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Date de décision *
              </label>
              <input
                type="date"
                value={newJuris.date}
                onChange={(e) => setNewJuris({ ...newJuris, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                N° de pourvoi / décision
              </label>
              <input
                type="text"
                value={newJuris.numero}
                onChange={(e) => setNewJuris({ ...newJuris, numero: e.target.value })}
                placeholder="Ex: 22-12.345"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              />
            </div>
          </div>

          {/* ECLI et Solution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                ECLI (optionnel)
              </label>
              <input
                type="text"
                value={newJuris.ecli}
                onChange={(e) => setNewJuris({ ...newJuris, ecli: e.target.value })}
                placeholder="Ex: FR:CCASS:2024:..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Solution
              </label>
              <select
                value={newJuris.solution}
                onChange={(e) => setNewJuris({ ...newJuris, solution: e.target.value as SolutionType })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
              >
                <option value="cassation">Cassation</option>
                <option value="rejet">Rejet</option>
                <option value="cassation_partielle">Cassation partielle</option>
                <option value="annulation">Annulation</option>
                <option value="confirmation">Confirmation</option>
                <option value="infirmation">Infirmation</option>
                <option value="irrecevabilite">Irrecevabilité</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Matières */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Matières (séparées par virgule)
            </label>
            <input
              type="text"
              value={newJuris.matieres}
              onChange={(e) => setNewJuris({ ...newJuris, matieres: e.target.value })}
              placeholder="Ex: contrats, responsabilité, prescription"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
            />
          </div>

          {/* Résumé */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Résumé / Chapeau (optionnel)
            </label>
            <textarea
              value={newJuris.resume}
              onChange={(e) => setNewJuris({ ...newJuris, resume: e.target.value })}
              rows={3}
              placeholder="Attendu principal ou résumé de la décision..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] resize-none"
            />
          </div>

          {/* Aperçu de la citation */}
          {newJuris.date && (
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Aperçu :</p>
              <p className="text-[var(--text)] font-medium">{getNewCitations().courte}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleInsertCitation('courte')}
                disabled={!newJuris.date}
                className="px-3 py-1.5 text-sm border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insérer (courte)
              </button>
              <button
                onClick={() => handleInsertCitation('complete')}
                disabled={!newJuris.date}
                className="px-3 py-1.5 text-sm border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insérer (complète)
              </button>
            </div>

            {onAdd && (
              <button
                onClick={handleAddJurisprudence}
                disabled={!newJuris.date}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enregistrer
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Recherche dans la base */
        <div className="space-y-3">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une jurisprudence..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Résultats */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredJurisprudences.map((juris) => (
              <div
                key={juris.id}
                onClick={() => {
                  setSelectedJurisprudence(juris)
                  onSelect(juris)
                }}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedJurisprudence?.id === juris.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] hover:border-[var(--accent)]'
                  }
                `}
              >
                <p className="font-medium text-[var(--text)]">
                  {juris.citationCourte}
                </p>
                {juris.resume && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {juris.resume}
                  </p>
                )}
                <div className="flex gap-1 mt-2">
                  {juris.matieres.slice(0, 3).map((matiere) => (
                    <span
                      key={matiere}
                      className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded"
                    >
                      {matiere}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {filteredJurisprudences.length === 0 && (
              <div className="text-center py-8 text-[var(--text-muted)]">
                {jurisprudences.length === 0
                  ? 'Aucune jurisprudence enregistrée'
                  : 'Aucun résultat pour cette recherche'
                }
              </div>
            )}
          </div>

          {/* Actions d'insertion */}
          {selectedJurisprudence && (
            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => handleInsertCitation('courte')}
                className="flex-1 px-3 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                Insérer citation courte
              </button>
              <button
                onClick={() => handleInsertCitation('complete')}
                className="flex-1 px-3 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                Insérer citation complète
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JurisprudenceSelector
