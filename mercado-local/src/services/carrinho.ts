
import type { Anuncio } from './anuncios'
import { buscarUsuarioAtual } from './usuario'

export type ItemCarrinho = {
  produto: Anuncio
  quantidade: number
}

const PREFIXO = 'mercadoLocalCarrinhoUsuario_'

async function obterChave(): Promise<string> {
  const usuario = await buscarUsuarioAtual()

  if (!usuario) {
    throw new Error(
      'Faça login para utilizar seu carrinho.'
    )
  }

  return `${PREFIXO}${usuario.id}`
}

function lerItens(chave: string): ItemCarrinho[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem(chave) || '[]'
    )

    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

function salvarItens(
  chave: string,
  itens: ItemCarrinho[]
): void {
  localStorage.setItem(chave, JSON.stringify(itens))

  window.dispatchEvent(
    new Event('carrinhoAtualizado')
  )
}

export async function listarCarrinho(): Promise<ItemCarrinho[]> {
  const chave = await obterChave()
  return lerItens(chave)
}

export async function adicionarAoCarrinho(
  produto: Anuncio,
  quantidade: number
): Promise<void> {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error('Quantidade inválida.')
  }

  const chave = await obterChave()
  const itens = lerItens(chave)

  const existente = itens.find(
    (item) => item.produto.id === produto.id
  )

  if (existente) {
    existente.quantidade += quantidade
  } else {
    itens.push({ produto, quantidade })
  }

  salvarItens(chave, itens)
}

export async function alterarQuantidade(
  id: string,
  quantidade: number
): Promise<void> {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error('Quantidade inválida.')
  }

  const chave = await obterChave()

  const itens = lerItens(chave).map((item) =>
    item.produto.id === id
      ? { ...item, quantidade }
      : item
  )

  salvarItens(chave, itens)
}

export async function removerDoCarrinho(
  id: string
): Promise<void> {
  const chave = await obterChave()

  const itens = lerItens(chave).filter(
    (item) => item.produto.id !== id
  )

  salvarItens(chave, itens)
}

export async function limparCarrinho(): Promise<void> {
  const chave = await obterChave()
  salvarItens(chave, [])
}

export function calcularTotal(
  itens: ItemCarrinho[]
): number {
  return itens.reduce(
    (total, item) =>
      total + item.produto.preco * item.quantidade,
    0
  )
}
