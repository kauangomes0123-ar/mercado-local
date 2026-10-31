
import type { ItemCarrinho } from './carrinho'

const API_URL = `http://${window.location.hostname}:8080/api/pedidos`

export type DadosComprador = {
  nome: string
  telefone: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  complemento: string
}

export type Pedido = {
  id: number
  data: string
  total: number
  status: string
}

async function verificarResposta(
  resposta: Response
): Promise<void> {
  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error('Faça login para finalizar o pedido.')
  }

  if (resposta.status === 400) {
    throw new Error(
      'Confira os dados do pedido. Um produto pode estar indisponível.'
    )
  }

  if (resposta.status === 404) {
    throw new Error('Pedido não encontrado.')
  }

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível concluir a operação. Erro: ${resposta.status}`
    )
  }
}

export async function criarPedido(
  comprador: DadosComprador,
  itens: ItemCarrinho[]
): Promise<Pedido> {
  if (itens.length === 0) {
    throw new Error('O carrinho está vazio.')
  }

  const produtos = itens.map((item) => {
    const id = item.produto.id

    if (!id.startsWith('api-')) {
      throw new Error(
        'O carrinho contém um produto antigo que não está no banco de dados.'
      )
    }

    const produtoId = Number(id.replace('api-', ''))

    if (!Number.isSafeInteger(produtoId) || produtoId < 1) {
      throw new Error('Identificador de produto inválido.')
    }

    return {
      produtoId,
      quantidade: item.quantidade,
    }
  })

  let resposta: Response

  try {
    resposta = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...comprador,
        telefone: comprador.telefone.replace(/\D/g, ''),
        itens: produtos,
      }),
    })
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique o Spring Boot.'
    )
  }

  await verificarResposta(resposta)

  return resposta.json()
}

export async function listarPedidos(): Promise<Pedido[]> {
  const resposta = await fetch(`${API_URL}/meus`, {
    credentials: 'include',
  })

  await verificarResposta(resposta)

  return resposta.json()
}

export async function buscarPedido(
  id: string
): Promise<Pedido> {
  const resposta = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      credentials: 'include',
    }
  )

  await verificarResposta(resposta)

  return resposta.json()
}

export type ItemPedidoRecebido = {
  produtoId: number
  nomeProduto: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export type PedidoRecebido = {
  id: number
  data: string
  comprador: string
  status: string
  totalVendedor: number
  itens: ItemPedidoRecebido[]
}

export async function listarPedidosRecebidos(): Promise<
  PedidoRecebido[]
> {
  let resposta: Response

  try {
    resposta = await fetch(`${API_URL}/recebidos`, {
      method: 'GET',
      credentials: 'include',
    })
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor.'
    )
  }

  await verificarResposta(resposta)

  return resposta.json()
}
