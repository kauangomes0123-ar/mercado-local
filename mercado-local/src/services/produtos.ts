
import {
  listarAnuncios,
  listarAnunciosBanco,
  type Anuncio,
} from './anuncios'

export const produtosDemonstrativos: Anuncio[] = []

export async function listarTodosProdutos(): Promise<Anuncio[]> {
  const anunciosLocais = listarAnuncios()

  try {
    const produtosBanco = await listarAnunciosBanco()

    return [
      ...produtosBanco,
      ...anunciosLocais,
    ]
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro)

    return [
      ...anunciosLocais,
    ]
  }
}

export async function buscarProduto(
  id: string
): Promise<Anuncio | undefined> {
  const produtos = await listarTodosProdutos()

  return produtos.find((produto) => produto.id === id)
}
