import { useRef } from 'react'
import { useLawyerProfileStore } from '../../store/useLawyerProfileStore'
import { useSettingsStore } from '../../store/useSettingsStore'

export function SettingsCabinet() {
  const profile = useLawyerProfileStore()
  const afficherCartoucheEditeur = useSettingsStore((s) => s.afficherCartoucheEditeur)
  const setAfficherCartoucheEditeur = useSettingsStore((s) => s.setAfficherCartoucheEditeur)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (base64: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setter(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Identité */}
      <div>
        <h4 className="text-sm font-medium mb-3">Identité</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Civilité</label>
            <select
              value={profile.civilite}
              onChange={(e) => profile.setField('civilite', e.target.value as 'Maitre' | 'Me' | '')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="Maitre">Maître</option>
              <option value="Me">Me</option>
              <option value="">Aucune</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Prénom</label>
            <input
              type="text"
              value={profile.prenom}
              onChange={(e) => profile.setField('prenom', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="Jean"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nom</label>
            <input
              type="text"
              value={profile.nom}
              onChange={(e) => profile.setField('nom', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="DUPONT"
            />
          </div>
        </div>
      </div>

      {/* Cabinet */}
      <div>
        <h4 className="text-sm font-medium mb-3">Cabinet</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nom du cabinet</label>
            <input
              type="text"
              value={profile.cabinet}
              onChange={(e) => profile.setField('cabinet', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="Cabinet DUPONT & Associés"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Barreau</label>
              <input
                type="text"
                value={profile.barreau}
                onChange={(e) => profile.setField('barreau', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">N° Toque</label>
              <input
                type="text"
                value={profile.numeroToque}
                onChange={(e) => profile.setField('numeroToque', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="A0123"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coordonnées */}
      <div>
        <h4 className="text-sm font-medium mb-3">Coordonnées</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Adresse</label>
            <input
              type="text"
              value={profile.adresse}
              onChange={(e) => profile.setField('adresse', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
              placeholder="123 rue du Palais"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Code postal</label>
              <input
                type="text"
                value={profile.codePostal}
                onChange={(e) => profile.setField('codePostal', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="75001"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Ville</label>
              <input
                type="text"
                value={profile.ville}
                onChange={(e) => profile.setField('ville', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="Paris"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
              <input
                type="tel"
                value={profile.telephone}
                onChange={(e) => profile.setField('telephone', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="01 23 45 67 89"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => profile.setField('email', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
                placeholder="contact@cabinet.fr"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo et Signature */}
      <div>
        <h4 className="text-sm font-medium mb-3">Visuels</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Logo */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Logo du cabinet</label>
            <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center">
              {profile.logo ? (
                <div className="relative">
                  <img
                    src={profile.logo}
                    alt="Logo"
                    className="max-h-16 mx-auto object-contain"
                  />
                  <button
                    onClick={() => profile.setLogo(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm text-gray-500 hover:text-[var(--accent)]"
                >
                  + Ajouter un logo
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, profile.setLogo)}
              />
            </div>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Signature</label>
            <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center">
              {profile.signature ? (
                <div className="relative">
                  <img
                    src={profile.signature}
                    alt="Signature"
                    className="max-h-16 mx-auto object-contain"
                  />
                  <button
                    onClick={() => profile.setSignature(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signatureInputRef.current?.click()}
                  className="text-sm text-gray-500 hover:text-[var(--accent)]"
                >
                  + Ajouter signature
                </button>
              )}
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, profile.setSignature)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Options d'affichage et d'export */}
      <div>
        <h4 className="text-sm font-medium mb-3">Options d'affichage et d'export</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherCartoucheEditeur"
              checked={afficherCartoucheEditeur}
              onChange={(e) => setAfficherCartoucheEditeur(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherCartoucheEditeur" className="text-sm">
              Afficher le cartouche cabinet dans l'editeur (modes Page/Continu)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherLogoEntete"
              checked={profile.afficherLogoEntete}
              onChange={(e) => profile.setField('afficherLogoEntete', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherLogoEntete" className="text-sm">
              Afficher le logo dans l'en-tête
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherSignature"
              checked={profile.afficherSignature}
              onChange={(e) => profile.setField('afficherSignature', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherSignature" className="text-sm">
              Afficher la signature en bas de document
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficherMentionsLegales"
              checked={profile.afficherMentionsLegales}
              onChange={(e) => profile.setField('afficherMentionsLegales', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="afficherMentionsLegales" className="text-sm">
              Afficher les mentions légales en pied de page
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Format pagination</label>
            <select
              value={profile.paginationFormat}
              onChange={(e) => profile.setField('paginationFormat', e.target.value as any)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm"
            >
              <option value="Page X sur Y">Page X sur Y</option>
              <option value="Page X/Y">Page X/Y</option>
              <option value="X/Y">X/Y</option>
              <option value="">Aucune</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mentions légales</label>
            <textarea
              value={profile.mentionsLegales}
              onChange={(e) => profile.setField('mentionsLegales', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--editor-bg)] text-sm h-20 resize-none"
              placeholder="Mentions légales du cabinet..."
            />
          </div>
        </div>
      </div>

      {/* Aperçu de l'en-tête */}
      {(profile.nom || profile.cabinet) && (
        <div className="border-t border-[var(--border)] pt-4">
          <h4 className="text-sm font-medium mb-3">Aperçu de l'en-tête</h4>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex items-start gap-4">
              {profile.logo && profile.afficherLogoEntete && (
                <img src={profile.logo} alt="Logo" className="h-12 object-contain" />
              )}
              <div className="flex-1 text-sm">
                {profile.cabinet && <div className="font-bold">{profile.cabinet}</div>}
                {profile.getFullName() && <div>{profile.getFullName()}</div>}
                {(profile.barreau || profile.numeroToque) && (
                  <div className="text-gray-500 text-xs">
                    {profile.barreau && `Barreau de ${profile.barreau}`}
                    {profile.barreau && profile.numeroToque && ' - '}
                    {profile.numeroToque && `Toque ${profile.numeroToque}`}
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                {profile.adresse && <div>{profile.adresse}</div>}
                {(profile.codePostal || profile.ville) && (
                  <div>{profile.codePostal} {profile.ville}</div>
                )}
                {profile.telephone && <div>Tél : {profile.telephone}</div>}
                {profile.email && <div>{profile.email}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
