import type { JSONContent } from '@tiptap/react'
import type { Clause, ClauseDomaine, ClauseType } from '../../types/editor-features'

// Type for clause data before auto-generated fields are applied
export type DefaultClauseData = Omit<Clause, 'id' | 'createdAt' | 'updatedAt' | 'texteRecherche'>

// Extraire le texte d'un JSONContent pour la recherche
export function extractTextFromContent(content: JSONContent): string {
  let text = ''

  if (content.text) {
    text += content.text + ' '
  }

  if (content.content) {
    for (const node of content.content) {
      text += extractTextFromContent(node)
    }
  }

  return text.trim()
}

// Raw default clause data
export const DEFAULT_CLAUSES: DefaultClauseData[] = [
  // === CONTRATS ===
  {
    titre: 'Clause de confidentialit\u00e9 standard',
    description: 'Clause de confidentialit\u00e9 pour contrats commerciaux',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 CONFIDENTIALIT\u00c9' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Chaque Partie s\'engage \u00e0 consid\u00e9rer comme strictement confidentielles toutes les informations de quelque nature qu\'elles soient, \u00e9crites ou orales, relatives \u00e0 l\'autre Partie, dont elle aura eu connaissance \u00e0 l\'occasion de la n\u00e9gociation, de la conclusion ou de l\'ex\u00e9cution du pr\u00e9sent contrat.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Les Parties s\'interdisent de divulguer ces informations \u00e0 des tiers, sauf accord pr\u00e9alable et \u00e9crit de l\'autre Partie.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Cette obligation de confidentialit\u00e9 perdurera pendant une dur\u00e9e de [DUR\u00c9E] \u00e0 compter de la fin du pr\u00e9sent contrat, pour quelque cause que ce soit.',
            },
          ],
        },
      ],
    },
    domaine: 'contrats' as ClauseDomaine,
    type: 'confidentialite' as ClauseType,
    tags: ['NDA', 'secret', 'commercial'],
    favoris: true,
    usageCount: 0,
    isBuiltin: true,
  },
  {
    titre: 'Clause de non-concurrence',
    description: 'Clause de non-concurrence pour contrats commerciaux ou de travail',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 NON-CONCURRENCE' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '[LA PARTIE] s\'engage, pendant toute la dur\u00e9e du pr\u00e9sent contrat et pendant une p\u00e9riode de [DUR\u00c9E] suivant son terme, pour quelque cause que ce soit, \u00e0 ne pas exercer, directement ou indirectement, une activit\u00e9 concurrente de celle de [L\'AUTRE PARTIE].',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Cette interdiction s\'applique sur le territoire de [TERRITOIRE].',
            },
          ],
        },
      ],
    },
    domaine: 'contrats' as ClauseDomaine,
    type: 'divers' as ClauseType,
    tags: ['concurrence', 'restriction'],
    favoris: false,
    usageCount: 0,
    isBuiltin: true,
  },
  {
    titre: 'Clause de force majeure',
    description: 'Clause de force majeure conforme \u00e0 l\'article 1218 du Code civil',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 FORCE MAJEURE' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Aucune des Parties ne sera tenue pour responsable d\'un manquement \u00e0 l\'une quelconque de ses obligations si ce manquement est provoqu\u00e9 par un \u00e9v\u00e9nement de force majeure au sens de l\'article 1218 du Code civil.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'La Partie invoquant un \u00e9v\u00e9nement de force majeure devra en informer l\'autre Partie dans un d\u00e9lai de [D\u00c9LAI] jours ouvr\u00e9s \u00e0 compter de sa survenance, en pr\u00e9cisant la nature de l\'\u00e9v\u00e9nement et sa dur\u00e9e pr\u00e9visible.',
            },
          ],
        },
      ],
    },
    domaine: 'contrats' as ClauseDomaine,
    type: 'responsabilite' as ClauseType,
    tags: ['force majeure', 'exon\u00e9ration', 'responsabilit\u00e9'],
    favoris: true,
    usageCount: 0,
    isBuiltin: true,
  },

  // === BAUX ===
  {
    titre: 'Clause de destination des lieux',
    description: 'Clause d\u00e9finissant l\'usage des locaux lou\u00e9s',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 DESTINATION DES LIEUX' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Les lieux lou\u00e9s sont destin\u00e9s \u00e0 l\'usage exclusif de [DESTINATION]. Le Preneur s\'interdit d\'exercer ou de faire exercer dans les lieux lou\u00e9s toute autre activit\u00e9.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Toute modification de la destination des lieux devra faire l\'objet d\'un accord pr\u00e9alable et \u00e9crit du Bailleur.',
            },
          ],
        },
      ],
    },
    domaine: 'baux' as ClauseDomaine,
    type: 'objet' as ClauseType,
    tags: ['bail', 'destination', 'locaux'],
    favoris: false,
    usageCount: 0,
    isBuiltin: true,
  },
  {
    titre: 'Clause r\u00e9solutoire bail',
    description: 'Clause r\u00e9solutoire pour d\u00e9faut de paiement du loyer',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 CLAUSE R\u00c9SOLUTOIRE' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '\u00c0 d\u00e9faut de paiement \u00e0 son \u00e9ch\u00e9ance d\'un seul terme de loyer ou de charges, ou \u00e0 d\u00e9faut d\'ex\u00e9cution de l\'une quelconque des conditions du pr\u00e9sent bail, celui-ci sera r\u00e9sili\u00e9 de plein droit, si bon semble au Bailleur, un mois apr\u00e8s un commandement de payer demeur\u00e9 infructueux, contenant d\u00e9claration par le Bailleur de son intention d\'user du b\u00e9n\u00e9fice de la pr\u00e9sente clause.',
            },
          ],
        },
      ],
    },
    domaine: 'baux' as ClauseDomaine,
    type: 'resiliation' as ClauseType,
    tags: ['bail', 'r\u00e9siliation', 'loyer', 'impay\u00e9'],
    favoris: true,
    usageCount: 0,
    isBuiltin: true,
  },

  // === SOCI\u00c9T\u00c9S ===
  {
    titre: 'Clause d\'agr\u00e9ment',
    description: 'Clause d\'agr\u00e9ment pour cession de parts sociales',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 CLAUSE D\'AGR\u00c9MENT' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Les parts sociales sont librement cessibles entre associ\u00e9s. Toute cession de parts sociales \u00e0 un tiers \u00e9tranger \u00e0 la soci\u00e9t\u00e9 est soumise \u00e0 l\'agr\u00e9ment pr\u00e9alable de la collectivit\u00e9 des associ\u00e9s statuant \u00e0 la majorit\u00e9 des [FRACTION] des parts sociales.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'L\'associ\u00e9 c\u00e9dant doit notifier le projet de cession \u00e0 la soci\u00e9t\u00e9 et \u00e0 chacun des associ\u00e9s par lettre recommand\u00e9e avec accus\u00e9 de r\u00e9ception.',
            },
          ],
        },
      ],
    },
    domaine: 'societes' as ClauseDomaine,
    type: 'divers' as ClauseType,
    tags: ['soci\u00e9t\u00e9', 'cession', 'parts', 'agr\u00e9ment'],
    favoris: false,
    usageCount: 0,
    isBuiltin: true,
  },

  // === LITIGES ===
  {
    titre: 'Clause attributive de juridiction',
    description: 'Clause d\'attribution de comp\u00e9tence territoriale',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 ATTRIBUTION DE JURIDICTION' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'TOUT LITIGE RELATIF \u00c0 LA VALIDIT\u00c9, L\'INTERPR\u00c9TATION, L\'EX\u00c9CUTION OU LA R\u00c9SILIATION DU PR\u00c9SENT CONTRAT SERA SOUMIS \u00c0 LA COMP\u00c9TENCE EXCLUSIVE DES TRIBUNAUX DE [VILLE], Y COMPRIS EN CAS DE R\u00c9F\u00c9R\u00c9, D\'APPEL EN GARANTIE OU DE PLURALIT\u00c9 DE D\u00c9FENDEURS.',
            },
          ],
        },
      ],
    },
    domaine: 'contrats' as ClauseDomaine,
    type: 'litiges' as ClauseType,
    tags: ['juridiction', 'comp\u00e9tence', 'tribunal'],
    favoris: true,
    usageCount: 0,
    isBuiltin: true,
  },
  {
    titre: 'Clause compromissoire (arbitrage)',
    description: 'Clause d\'arbitrage pour les litiges commerciaux',
    contenu: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'ARTICLE X \u2013 ARBITRAGE' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Tout diff\u00e9rend d\u00e9coulant du pr\u00e9sent contrat ou en relation avec celui-ci sera tranch\u00e9 d\u00e9finitivement suivant le R\u00e8glement d\'arbitrage de [CENTRE D\'ARBITRAGE], par un ou plusieurs arbitres nomm\u00e9s conform\u00e9ment \u00e0 ce R\u00e8glement.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Le si\u00e8ge de l\'arbitrage sera [VILLE]. La langue de l\'arbitrage sera le fran\u00e7ais.',
            },
          ],
        },
      ],
    },
    domaine: 'commercial' as ClauseDomaine,
    type: 'litiges' as ClauseType,
    tags: ['arbitrage', 'CCI', 'litige', 'international'],
    favoris: false,
    usageCount: 0,
    isBuiltin: true,
  },
]

// Build complete Clause objects with auto-generated fields
export function getDefaultClauses(): Clause[] {
  const now = new Date().toISOString()

  return DEFAULT_CLAUSES.map((clause, index) => ({
    ...clause,
    id: `builtin-clause-${index}`,
    texteRecherche: extractTextFromContent(clause.contenu),
    createdAt: now,
    updatedAt: now,
  }))
}
