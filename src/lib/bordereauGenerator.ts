/**
 * Générateur de bordereau de communication de pièces
 * Produit un tableau TipTap JSON prêt à insérer dans l'éditeur
 */

import type { Piece, BordereauPieces } from '../types/legal'
import { PIECE_NATURE_LABELS, formatDateJuridique } from '../types/legal'

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

function textNode(text: string, bold = false): TipTapNode {
  const node: TipTapNode = { type: 'text', text }
  if (bold) {
    node.marks = [{ type: 'bold' }]
  }
  return node
}

function paragraphNode(content: TipTapNode[]): TipTapNode {
  return { type: 'paragraph', content }
}

function cellNode(content: TipTapNode[], header = false): TipTapNode {
  return {
    type: header ? 'tableHeader' : 'tableCell',
    content: [paragraphNode(content)],
  }
}

function rowNode(cells: TipTapNode[]): TipTapNode {
  return { type: 'tableRow', content: cells }
}

/**
 * Génère un bordereau de communication de pièces au format TipTap JSON
 * Prêt à être inséré dans l'éditeur via editor.commands.insertContent()
 */
export function generateBordereau(bordereau: BordereauPieces): TipTapNode[] {
  const nodes: TipTapNode[] = []

  // Titre
  nodes.push({
    type: 'heading',
    attrs: { level: 2 },
    content: [textNode('BORDEREAU DE COMMUNICATION DE PIECES', true)],
  })

  // Informations du dossier
  const infoLines: string[] = []
  if (bordereau.juridiction) {
    infoLines.push(bordereau.juridiction)
  }
  if (bordereau.numeroRG) {
    infoLines.push(`RG n° ${bordereau.numeroRG}`)
  }
  infoLines.push(`${bordereau.parties.demandeur} c/ ${bordereau.parties.défendeur}`)

  nodes.push(paragraphNode(infoLines.map((line, i) => {
    const parts: TipTapNode[] = [textNode(line)]
    if (i < infoLines.length - 1) {
      parts.push({ type: 'hardBreak' })
    }
    return parts
  }).flat()))

  // Espace
  nodes.push(paragraphNode([textNode('')]))

  // En-tête du tableau
  const headerRow = rowNode([
    cellNode([textNode('N°', true)], true),
    cellNode([textNode('Pièce', true)], true),
    cellNode([textNode('Nature', true)], true),
    cellNode([textNode('Date', true)], true),
    cellNode([textNode('Observations', true)], true),
  ])

  // Lignes des pièces
  const pieceRows = bordereau.pieces
    .sort((a, b) => a.numero - b.numero)
    .map((piece) => {
      const dateStr = piece.dateDocument
        ? formatDateJuridique(piece.dateDocument)
        : '-'

      return rowNode([
        cellNode([textNode(String(piece.numero))]),
        cellNode([textNode(piece.titre)]),
        cellNode([textNode(PIECE_NATURE_LABELS[piece.nature])]),
        cellNode([textNode(dateStr)]),
        cellNode([textNode(piece.description || '-')]),
      ])
    })

  // Table
  nodes.push({
    type: 'table',
    content: [headerRow, ...pieceRows],
  })

  // Pied
  nodes.push(paragraphNode([textNode('')]))
  nodes.push(paragraphNode([
    textNode(`Fait le ${formatDateJuridique(new Date().toISOString().slice(0, 10))}`),
  ]))

  return nodes
}

/**
 * Génère un bordereau simple à partir d'une liste de pièces et d'infos basiques
 */
export function generateSimpleBordereau(
  pieces: Piece[],
  options: {
    demandeur: string
    defendeur: string
    juridiction?: string
    numeroRG?: string
  }
): TipTapNode[] {
  const bordereau: BordereauPieces = {
    id: `brd_${Date.now()}`,
    affaireReference: options.numeroRG || '',
    parties: {
      demandeur: options.demandeur,
      défendeur: options.defendeur,
    },
    juridiction: options.juridiction,
    numeroRG: options.numeroRG,
    pieces,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  }

  return generateBordereau(bordereau)
}
