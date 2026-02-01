// Variables par défaut pour les documents juridiques

import type { VariableDefinition } from '../../types/editor-features'

export const DEFAULT_VARIABLES: VariableDefinition[] = [
  // === CLIENT ===
  {
    key: 'client.civilite',
    label: 'Civilité du client',
    category: 'client',
    type: 'select',
    options: ['M.', 'Mme', 'Mlle', 'M. et Mme', 'La société', 'L\'association'],
    defaultValue: 'M.',
    isBuiltin: true,
  },
  {
    key: 'client.nom',
    label: 'Nom du client',
    category: 'client',
    type: 'text',
    placeholder: 'DUPONT',
    isBuiltin: true,
  },
  {
    key: 'client.prenom',
    label: 'Prénom du client',
    category: 'client',
    type: 'text',
    placeholder: 'Jean',
    isBuiltin: true,
  },
  {
    key: 'client.adresse',
    label: 'Adresse du client',
    category: 'client',
    type: 'text',
    placeholder: '1 rue de la Paix',
    isBuiltin: true,
  },
  {
    key: 'client.code_postal',
    label: 'Code postal',
    category: 'client',
    type: 'text',
    placeholder: '75001',
    isBuiltin: true,
  },
  {
    key: 'client.ville',
    label: 'Ville du client',
    category: 'client',
    type: 'text',
    placeholder: 'Paris',
    isBuiltin: true,
  },
  {
    key: 'client.email',
    label: 'Email du client',
    category: 'client',
    type: 'text',
    placeholder: 'client@example.com',
    isBuiltin: true,
  },
  {
    key: 'client.telephone',
    label: 'Téléphone du client',
    category: 'client',
    type: 'text',
    placeholder: '01 23 45 67 89',
    isBuiltin: true,
  },

  // === PARTIE ADVERSE ===
  {
    key: 'adverse.civilite',
    label: 'Civilité adverse',
    category: 'adverse',
    type: 'select',
    options: ['M.', 'Mme', 'Mlle', 'M. et Mme', 'La société', 'L\'association'],
    defaultValue: 'M.',
    isBuiltin: true,
  },
  {
    key: 'adverse.nom',
    label: 'Nom partie adverse',
    category: 'adverse',
    type: 'text',
    placeholder: 'MARTIN',
    isBuiltin: true,
  },
  {
    key: 'adverse.prenom',
    label: 'Prénom partie adverse',
    category: 'adverse',
    type: 'text',
    placeholder: 'Pierre',
    isBuiltin: true,
  },
  {
    key: 'adverse.adresse',
    label: 'Adresse partie adverse',
    category: 'adverse',
    type: 'text',
    placeholder: '2 avenue des Champs-Élysées',
    isBuiltin: true,
  },
  {
    key: 'adverse.avocat',
    label: 'Avocat adverse',
    category: 'adverse',
    type: 'text',
    placeholder: 'Maître DURAND',
    isBuiltin: true,
  },

  // === DOSSIER ===
  {
    key: 'dossier.reference',
    label: 'Référence dossier',
    category: 'dossier',
    type: 'text',
    placeholder: '2024-001',
    isBuiltin: true,
  },
  {
    key: 'dossier.rg',
    label: 'Numéro RG',
    category: 'dossier',
    type: 'text',
    placeholder: 'RG 24/12345',
    isBuiltin: true,
  },
  {
    key: 'dossier.objet',
    label: 'Objet du dossier',
    category: 'dossier',
    type: 'text',
    placeholder: 'Litige commercial',
    isBuiltin: true,
  },
  {
    key: 'dossier.nature',
    label: 'Nature de l\'affaire',
    category: 'dossier',
    type: 'select',
    options: ['Civil', 'Commercial', 'Prud\'homal', 'Pénal', 'Administratif', 'Famille'],
    defaultValue: 'Civil',
    isBuiltin: true,
  },

  // === JURIDICTION ===
  {
    key: 'juridiction.nom',
    label: 'Nom de la juridiction',
    category: 'juridiction',
    type: 'select',
    options: [
      'Tribunal judiciaire',
      'Tribunal de commerce',
      'Conseil de prud\'hommes',
      'Cour d\'appel',
      'Tribunal administratif',
      'Cour administrative d\'appel',
      'Conseil d\'État',
      'Cour de cassation',
    ],
    defaultValue: 'Tribunal judiciaire',
    isBuiltin: true,
  },
  {
    key: 'juridiction.ville',
    label: 'Ville de la juridiction',
    category: 'juridiction',
    type: 'text',
    placeholder: 'Paris',
    isBuiltin: true,
  },
  {
    key: 'juridiction.chambre',
    label: 'Chambre',
    category: 'juridiction',
    type: 'text',
    placeholder: '1ère chambre civile',
    isBuiltin: true,
  },
  {
    key: 'juridiction.juge',
    label: 'Nom du juge',
    category: 'juridiction',
    type: 'text',
    placeholder: 'Monsieur le Juge BERNARD',
    isBuiltin: true,
  },

  // === AVOCAT ===
  {
    key: 'avocat.civilite',
    label: 'Civilité avocat',
    category: 'avocat',
    type: 'select',
    options: ['Maître', 'Me'],
    defaultValue: 'Maître',
    isBuiltin: true,
  },
  {
    key: 'avocat.nom',
    label: 'Nom de l\'avocat',
    category: 'avocat',
    type: 'text',
    placeholder: 'DURAND',
    isBuiltin: true,
  },
  {
    key: 'avocat.prenom',
    label: 'Prénom de l\'avocat',
    category: 'avocat',
    type: 'text',
    placeholder: 'Marie',
    isBuiltin: true,
  },
  {
    key: 'avocat.cabinet',
    label: 'Nom du cabinet',
    category: 'avocat',
    type: 'text',
    placeholder: 'Cabinet DURAND & Associés',
    isBuiltin: true,
  },
  {
    key: 'avocat.barreau',
    label: 'Barreau d\'inscription',
    category: 'avocat',
    type: 'text',
    placeholder: 'Paris',
    isBuiltin: true,
  },
  {
    key: 'avocat.toque',
    label: 'Numéro de toque',
    category: 'avocat',
    type: 'text',
    placeholder: 'A0123',
    isBuiltin: true,
  },
  {
    key: 'avocat.adresse',
    label: 'Adresse du cabinet',
    category: 'avocat',
    type: 'text',
    placeholder: '10 rue du Palais',
    isBuiltin: true,
  },
  {
    key: 'avocat.code_postal',
    label: 'Code postal cabinet',
    category: 'avocat',
    type: 'text',
    placeholder: '75001',
    isBuiltin: true,
  },
  {
    key: 'avocat.ville',
    label: 'Ville du cabinet',
    category: 'avocat',
    type: 'text',
    placeholder: 'Paris',
    isBuiltin: true,
  },
  {
    key: 'avocat.telephone',
    label: 'Téléphone cabinet',
    category: 'avocat',
    type: 'text',
    placeholder: '01 23 45 67 89',
    isBuiltin: true,
  },
  {
    key: 'avocat.email',
    label: 'Email cabinet',
    category: 'avocat',
    type: 'text',
    placeholder: 'contact@cabinet-durand.fr',
    isBuiltin: true,
  },

  // === DATES ===
  {
    key: 'date.jour',
    label: 'Date du jour',
    category: 'date',
    type: 'date',
    isBuiltin: true,
  },
  {
    key: 'date.jour_lettres',
    label: 'Date du jour (en lettres)',
    category: 'date',
    type: 'text',
    placeholder: 'quinze janvier deux mille vingt-quatre',
    isBuiltin: true,
  },
  {
    key: 'date.audience',
    label: 'Date d\'audience',
    category: 'date',
    type: 'date',
    isBuiltin: true,
  },
  {
    key: 'date.echeance',
    label: 'Date d\'échéance',
    category: 'date',
    type: 'date',
    isBuiltin: true,
  },
  {
    key: 'date.signification',
    label: 'Date de signification',
    category: 'date',
    type: 'date',
    isBuiltin: true,
  },

  // === MONTANTS ===
  {
    key: 'montant.principal',
    label: 'Montant principal',
    category: 'custom',
    type: 'number',
    placeholder: '10000',
    isBuiltin: true,
  },
  {
    key: 'montant.article700',
    label: 'Article 700 CPC',
    category: 'custom',
    type: 'number',
    defaultValue: '3000',
    isBuiltin: true,
  },
  {
    key: 'montant.dommages_interets',
    label: 'Dommages-intérêts',
    category: 'custom',
    type: 'number',
    placeholder: '5000',
    isBuiltin: true,
  },
]

// Grouper les variables par catégorie
export function getVariablesByCategory(): Record<string, VariableDefinition[]> {
  const grouped: Record<string, VariableDefinition[]> = {}

  for (const variable of DEFAULT_VARIABLES) {
    if (!grouped[variable.category]) {
      grouped[variable.category] = []
    }
    grouped[variable.category].push(variable)
  }

  return grouped
}

// Trouver une variable par clé
export function findVariableByKey(key: string): VariableDefinition | undefined {
  return DEFAULT_VARIABLES.find(v => v.key === key)
}
