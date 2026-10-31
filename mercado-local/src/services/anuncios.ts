
export type Anuncio = {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagem: string
  vendedor: string
  usuarioId?: number | null
}

type ProdutoAPI = {
  id: number
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagem: string
  vendedor: string
  usuarioId: number | null
}

const API_URL = `http://${window.location.hostname}:8080/api/produtos`
const CHAVE = 'mercadoLocalAnuncios'

export function listarAnuncios(): Anuncio[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE) || '[]'
    )

    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

export function salvarAnuncios(anuncios: Anuncio[]) {
  localStorage.setItem(CHAVE, JSON.stringify(anuncios))
}

function converterProduto(produto: ProdutoAPI): Anuncio {
  return {
    id: `api-${produto.id}`,
    nome: produto.nome,
    descricao: produto.descricao,
    preco: Number(produto.preco),
    categoria: produto.categoria,
    imagem: produto.imagem,
    vendedor: produto.vendedor,
    usuarioId: produto.usuarioId,
  }
}

function verificarResposta(resposta: Response) {
  if (resposta.status === 401) {
    throw new Error(
      'Sua sessão expirou. Faça login novamente.'
    )
  }

  if (resposta.status === 403) {
    throw new Error(
      'Você não tem permissão para realizar esta operação.'
    )
  }

  if (resposta.status === 404) {
    throw new Error('Anúncio não encontrado.')
  }

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível concluir a operação. Erro: ${resposta.status}`
    )
  }
}

export async function listarAnunciosBanco(): Promise<Anuncio[]> {
  const resposta = await fetch(API_URL, {
    method: 'GET',
    credentials: 'include',
  })

  verificarResposta(resposta)

  const produtos: ProdutoAPI[] = await resposta.json()

  return produtos.map(converterProduto)
}

export async function buscarAnuncioBanco(
  id: string
): Promise<Anuncio | undefined> {
  if (!id.startsWith('api-')) {
    return listarAnuncios().find(
      (anuncio) => anuncio.id === id
    )
  }

  const numero = id.replace('api-', '')

  const resposta = await fetch(`${API_URL}/${numero}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (resposta.status === 404) {
    return undefined
  }

  verificarResposta(resposta)

  const produto: ProdutoAPI = await resposta.json()

  return converterProduto(produto)
}

export async function adicionarAnuncio(
  anuncio: Anuncio
): Promise<Anuncio> {
  const resposta = await fetch(API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: anuncio.nome,
      descricao: anuncio.descricao,
      preco: anuncio.preco,
      categoria: anuncio.categoria,
      imagem: anuncio.imagem,
    }),
  })

  verificarResposta(resposta)

  const produto: ProdutoAPI = await resposta.json()

  return converterProduto(produto)
}

export async function atualizarAnuncio(
  anuncio: Anuncio
): Promise<void> {
  if (!anuncio.id.startsWith('api-')) {
    const anuncios = listarAnuncios().map((item) =>
      item.id === anuncio.id ? anuncio : item
    )

    salvarAnuncios(anuncios)
    return
  }

  const numero = anuncio.id.replace('api-', '')

  const resposta = await fetch(`${API_URL}/${numero}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: anuncio.nome,
      descricao: anuncio.descricao,
      preco: anuncio.preco,
      categoria: anuncio.categoria,
      imagem: anuncio.imagem,
    }),
  })

  verificarResposta(resposta)
}

export async function excluirAnuncio(
  id: string
): Promise<void> {
  if (!id.startsWith('api-')) {
    salvarAnuncios(
      listarAnuncios().filter(
        (item) => item.id !== id
      )
    )
    return
  }

  const numero = id.replace('api-', '')

  const resposta = await fetch(`${API_URL}/${numero}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  verificarResposta(resposta)
}
