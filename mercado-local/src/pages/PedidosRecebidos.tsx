
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  ArrowLeft,
  Store,
  Package,
  CalendarDays,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react'

import {
  listarPedidosRecebidos,
  type PedidoRecebido,
} from '../services/pedidos'

import './PedidosRecebidos.css'

function formatarPreco(valor: number): string {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatarData(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
}

export default function PedidosRecebidos() {
  const [pedidos, setPedidos] = useState<PedidoRecebido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregarPedidos() {
      try {
        const resultado = await listarPedidosRecebidos()

        if (ativo) {
          setPedidos(resultado)
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os pedidos recebidos.'
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarPedidos()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <main className="pedidos-recebidos-pagina">
      <div className="pedidos-recebidos-container">
        <Link to="/" className="pedidos-recebidos-voltar">
          <ArrowLeft size={19} />
          Voltar para a Home
        </Link>

        <div className="pedidos-recebidos-cabecalho">
          <div className="pedidos-recebidos-icone">
            <Store size={30} />
          </div>

          <div>
            <h1>Pedidos Recebidos</h1>
            <p>
              Acompanhe os pedidos demonstrativos feitos
              com seus produtos.
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="pedidos-recebidos-vazio">
            <Package size={46} />
            <h2>Carregando pedidos...</h2>
          </div>
        ) : erro ? (
          <div className="pedidos-recebidos-vazio">
            <Package size={46} />
            <h2>Não foi possível carregar os pedidos</h2>
            <p>{erro}</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="pedidos-recebidos-vazio">
            <ShoppingBag size={50} />
            <h2>Você ainda não recebeu pedidos</h2>
            <p>
              Quando alguém comprar um produto anunciado
              por você, o pedido aparecerá aqui.
            </p>

            <Link
              to="/meus-anuncios"
              className="pedidos-recebidos-botao"
            >
              Ver meus anúncios
            </Link>
          </div>
        ) : (
          <>
            <p className="pedidos-recebidos-contagem">
              {pedidos.length}{' '}
              {pedidos.length === 1
                ? 'pedido recebido'
                : 'pedidos recebidos'}
            </p>

            <div className="pedidos-recebidos-lista">
              {pedidos.map((pedido) => (
                <article
                  className="pedidos-recebidos-card"
                  key={pedido.id}
                >
                  <div className="pedidos-recebidos-card-topo">
                    <div>
                      <span className="pedidos-recebidos-label">
                        Número do pedido
                      </span>

                      <h2>#{pedido.id}</h2>
                    </div>

                    <span className="pedidos-recebidos-status">
                      <CheckCircle size={16} />
                      {pedido.status === 'CONFIRMADO'
                        ? 'Confirmado'
                        : pedido.status}
                    </span>
                  </div>

                  <div className="pedidos-recebidos-informacoes">
                    <div>
                      <span className="pedidos-recebidos-label">
                        Comprador
                      </span>
                      <strong>{pedido.comprador}</strong>
                    </div>

                    <div>
                      <span className="pedidos-recebidos-label">
                        <CalendarDays size={16} />
                        Data do pedido
                      </span>
                      <strong>
                        {formatarData(pedido.data)}
                      </strong>
                    </div>
                  </div>

                  <div className="pedidos-recebidos-produtos">
                    <h3>Produtos vendidos</h3>

                    {pedido.itens.map((item) => (
                      <div
                        className="pedidos-recebidos-produto"
                        key={item.produtoId}
                      >
                        <div>
                          <strong>{item.nomeProduto}</strong>
                          <span>
                            {item.quantidade} x{' '}
                            {formatarPreco(item.precoUnitario)}
                          </span>
                        </div>

                        <strong>
                          {formatarPreco(item.subtotal)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="pedidos-recebidos-total">
                    <span>Total dos seus produtos</span>
                    <strong>
                      {formatarPreco(pedido.totalVendedor)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
