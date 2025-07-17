import React from 'react'
import { LPE } from '../types/lpe.types'

export type ArticleContainerContextType = {
  tocId: string | null
  setTocId: React.Dispatch<React.SetStateAction<string | null>>
  articleData: LPE.Article.Data | null
}

export const ArticleContainerContext =
  React.createContext<ArticleContainerContextType>(null as any)

export const useArticleContainerContext = () =>
  React.useContext(ArticleContainerContext)
