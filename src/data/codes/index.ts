// Index des codes juridiques intégrés

export type { Article } from './code-civil'
export { CODE_CIVIL_ARTICLES, searchArticles, findArticleByNumero } from './code-civil'
export { CODE_PROCEDURE_CIVILE_ARTICLES, searchArticlesCPC, findArticleCPCByNumero } from './code-procedure-civile'
export { CODE_CRPA_ARTICLES, searchArticlesCRPA, findArticleCRPAByNumero } from './code-crpa'
export { CODE_PENAL_ARTICLES, searchArticlesPenal, findArticlePenalByNumero } from './code-penal'

import { CODE_CIVIL_ARTICLES, searchArticles } from './code-civil'
import { CODE_PROCEDURE_CIVILE_ARTICLES, searchArticlesCPC } from './code-procedure-civile'
import { CODE_CRPA_ARTICLES, searchArticlesCRPA } from './code-crpa'
import { CODE_PENAL_ARTICLES, searchArticlesPenal } from './code-penal'
import type { Article } from './code-civil'

export type CodeType = 'civil' | 'cpc' | 'crpa' | 'penal'

export const CODE_LABELS: Record<CodeType, string> = {
  civil: 'Code civil',
  cpc: 'CPC',
  crpa: 'CRPA',
  penal: 'Code pénal',
}

export const CODE_FULL_NAMES: Record<CodeType, string> = {
  civil: 'Code civil',
  cpc: 'Code de procédure civile',
  crpa: 'Code des relations entre le public et l\'administration',
  penal: 'Code pénal',
}

// Identifiants Légifrance pour chaque code
export const LEGIFRANCE_CODE_IDS: Record<CodeType, string> = {
  civil: 'LEGITEXT000006070721',
  cpc: 'LEGITEXT000006070716',
  crpa: 'LEGITEXT000031366350',
  penal: 'LEGITEXT000006070719',
}

// Recherche globale dans tous les codes
export function searchAllCodes(query: string): Array<Article & { code: CodeType }> {
  const results: Array<Article & { code: CodeType }> = []

  // Recherche dans le Code civil
  for (const article of searchArticles(query)) {
    results.push({ ...article, code: 'civil' })
  }

  // Recherche dans le CPC
  for (const article of searchArticlesCPC(query)) {
    results.push({ ...article, code: 'cpc' })
  }

  // Recherche dans le CRPA
  for (const article of searchArticlesCRPA(query)) {
    results.push({ ...article, code: 'crpa' })
  }

  // Recherche dans le Code pénal
  for (const article of searchArticlesPenal(query)) {
    results.push({ ...article, code: 'penal' })
  }

  return results
}

// Obtenir tous les articles d'un code
export function getArticlesByCode(code: CodeType): Article[] {
  switch (code) {
    case 'civil':
      return CODE_CIVIL_ARTICLES
    case 'cpc':
      return CODE_PROCEDURE_CIVILE_ARTICLES
    case 'crpa':
      return CODE_CRPA_ARTICLES
    case 'penal':
      return CODE_PENAL_ARTICLES
    default:
      return []
  }
}

// Formater une citation d'article
export function formatArticleCitation(article: Article, code: CodeType): string {
  const codeLabels: Record<CodeType, string> = {
    civil: 'C. civ.',
    cpc: 'CPC',
    crpa: 'CRPA',
    penal: 'C. pén.',
  }
  return `article ${article.numero} du ${codeLabels[code]}`
}

// Formater le texte complet pour insertion
export function formatArticleForInsertion(article: Article, code: CodeType): string {
  return `Aux termes de l'article ${article.numero} du ${CODE_FULL_NAMES[code]} : « ${article.contenu} »`
}

// Générer l'URL Légifrance pour un article
export function getLegifranceArticleUrl(articleNumero: string, code: CodeType): string {
  const codeId = LEGIFRANCE_CODE_IDS[code]
  // Format général pour accéder à un article sur Légifrance
  return `https://www.legifrance.gouv.fr/codes/article_lc/${codeId}?search_in_code=true&article=${encodeURIComponent(articleNumero)}`
}

// Générer l'URL de recherche Légifrance pour un code
export function getLegifranceSearchUrl(query: string, code?: CodeType): string {
  if (code) {
    const codeId = LEGIFRANCE_CODE_IDS[code]
    return `https://www.legifrance.gouv.fr/codes/texte_lc/${codeId}/rechercheArticle?searchField=ALL&query=${encodeURIComponent(query)}&pageSize=10&page=1`
  }
  // Recherche globale sur Légifrance
  return `https://www.legifrance.gouv.fr/search/all?tab_selection=all&query=${encodeURIComponent(query)}&searchField=ALL&typePagination=DEFAULT&sortValue=PERTINENCE&pageSize=10&page=1`
}

// Générer l'URL de la table des matières d'un code sur Légifrance
export function getLegifranceCodeUrl(code: CodeType): string {
  const codeId = LEGIFRANCE_CODE_IDS[code]
  return `https://www.legifrance.gouv.fr/codes/texte_lc/${codeId}`
}
