// Index des codes juridiques intégrés

export type { Article } from './code-civil'
export { CODE_CIVIL_ARTICLES, searchArticles, findArticleByNumero } from './code-civil'
export { CODE_PROCEDURE_CIVILE_ARTICLES, searchArticlesCPC, findArticleCPCByNumero } from './code-procedure-civile'
export { CODE_CRPA_ARTICLES, searchArticlesCRPA, findArticleCRPAByNumero } from './code-crpa'
export { CODE_PENAL_ARTICLES, searchArticlesPenal, findArticlePenalByNumero } from './code-penal'
export { CODE_TRAVAIL_ARTICLES, searchArticlesTravail, findArticleTravailByNumero } from './code-travail'
export { CODE_COMMERCE_ARTICLES, searchArticlesCommerce, findArticleCommerceByNumero } from './code-commerce'
export { CODE_CONSOMMATION_ARTICLES, searchArticlesConsommation, findArticleConsommationByNumero } from './code-consommation'

import { CODE_CIVIL_ARTICLES, searchArticles } from './code-civil'
import { CODE_PROCEDURE_CIVILE_ARTICLES, searchArticlesCPC } from './code-procedure-civile'
import { CODE_CRPA_ARTICLES, searchArticlesCRPA } from './code-crpa'
import { CODE_PENAL_ARTICLES, searchArticlesPenal } from './code-penal'
import { CODE_TRAVAIL_ARTICLES, searchArticlesTravail } from './code-travail'
import { CODE_COMMERCE_ARTICLES, searchArticlesCommerce } from './code-commerce'
import { CODE_CONSOMMATION_ARTICLES, searchArticlesConsommation } from './code-consommation'
import type { Article } from './code-civil'

export type CodeType = 'civil' | 'cpc' | 'crpa' | 'penal' | 'travail' | 'commerce' | 'consommation'

export const CODE_LABELS: Record<CodeType, string> = {
  civil: 'Code civil',
  cpc: 'CPC',
  crpa: 'CRPA',
  penal: 'Code pénal',
  travail: 'Code du travail',
  commerce: 'Code de commerce',
  consommation: 'Code conso.',
}

export const CODE_FULL_NAMES: Record<CodeType, string> = {
  civil: 'Code civil',
  cpc: 'Code de procédure civile',
  crpa: 'Code des relations entre le public et l\'administration',
  penal: 'Code pénal',
  travail: 'Code du travail',
  commerce: 'Code de commerce',
  consommation: 'Code de la consommation',
}

// Identifiants Légifrance pour chaque code
export const LEGIFRANCE_CODE_IDS: Record<CodeType, string> = {
  civil: 'LEGITEXT000006070721',
  cpc: 'LEGITEXT000006070716',
  crpa: 'LEGITEXT000031366350',
  penal: 'LEGITEXT000006070719',
  travail: 'LEGITEXT000006072050',
  commerce: 'LEGITEXT000005634379',
  consommation: 'LEGITEXT000006069565',
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

  // Recherche dans le Code du travail
  for (const article of searchArticlesTravail(query)) {
    results.push({ ...article, code: 'travail' })
  }

  // Recherche dans le Code de commerce
  for (const article of searchArticlesCommerce(query)) {
    results.push({ ...article, code: 'commerce' })
  }

  // Recherche dans le Code de la consommation
  for (const article of searchArticlesConsommation(query)) {
    results.push({ ...article, code: 'consommation' })
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
    case 'travail':
      return CODE_TRAVAIL_ARTICLES
    case 'commerce':
      return CODE_COMMERCE_ARTICLES
    case 'consommation':
      return CODE_CONSOMMATION_ARTICLES
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
    travail: 'C. trav.',
    commerce: 'C. com.',
    consommation: 'C. consom.',
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
