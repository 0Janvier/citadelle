/**
 * LetterheadOverlay - Cartouche de cabinet affiché dans l'éditeur
 *
 * Affiche l'en-tête du cabinet (nom, avocat, adresse, contact, barreau)
 * au-dessus du contenu de l'éditeur en mode Page et Continu.
 * Le style reproduit le cartouche du PDF : barre d'accent à gauche,
 * typographie hiérarchisée.
 *
 * Lit les données depuis useLawyerProfileStore.
 * Retourne null si aucune donnée de profil n'est disponible.
 */

import { useLawyerProfileStore } from '../store/useLawyerProfileStore'
import { useSettingsStore } from '../store/useSettingsStore'

export function LetterheadOverlay() {
  const profile = useLawyerProfileStore()
  const afficherCartoucheEditeur = useSettingsStore((s) => s.afficherCartoucheEditeur)

  // Do not render if the setting is disabled
  if (!afficherCartoucheEditeur) return null

  // Do not render if no meaningful profile data
  if (!profile.cabinet && !profile.nom) return null

  const fullName = [profile.civilite, profile.prenom, profile.nom].filter(Boolean).join(' ')
  const fullAddress = [
    profile.adresse,
    [profile.codePostal, profile.ville].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ')

  const contactParts: string[] = []
  if (profile.telephone) contactParts.push(`Tel. ${profile.telephone}`)
  if (profile.email) contactParts.push(profile.email)
  const contactLine = contactParts.join(' \u2013 ')

  const barreauParts: string[] = []
  if (profile.barreau) barreauParts.push(`Barreau de ${profile.barreau}`)
  if (profile.numeroToque) barreauParts.push(`Toque ${profile.numeroToque}`)
  const barreauLine = barreauParts.join(' \u2013 ')

  const showLogo = profile.logo && profile.afficherLogoEntete

  return (
    <div
      className="letterhead-overlay select-none pointer-events-none"
      style={{
        borderLeft: '3px solid #1a365d',
        paddingLeft: '12px',
        paddingTop: '4px',
        paddingBottom: '8px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      {/* Logo */}
      {showLogo && (
        <img
          src={profile.logo!}
          alt="Logo cabinet"
          style={{
            height: '40px',
            width: 'auto',
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />
      )}

      {/* Text content */}
      <div style={{ minWidth: 0 }}>
        {profile.cabinet && (
          <div
            style={{
              fontWeight: 700,
              fontSize: '15px',
              color: '#1a365d',
              lineHeight: 1.3,
              fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
            }}
          >
            {profile.cabinet}
          </div>
        )}
        {fullName && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text, #333)',
              lineHeight: 1.4,
              marginTop: '1px',
            }}
          >
            {fullName}
          </div>
        )}
        {fullAddress && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted, #666)',
              lineHeight: 1.3,
              marginTop: '1px',
            }}
          >
            {fullAddress}
          </div>
        )}
        {contactLine && (
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-muted, #888)',
              lineHeight: 1.3,
              marginTop: '1px',
            }}
          >
            {contactLine}
          </div>
        )}
        {barreauLine && (
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-muted, #888)',
              fontStyle: 'italic',
              lineHeight: 1.3,
              marginTop: '1px',
            }}
          >
            {barreauLine}
          </div>
        )}
      </div>
    </div>
  )
}
