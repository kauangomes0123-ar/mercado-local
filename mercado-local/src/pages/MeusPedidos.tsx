
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

import {
  listarPedidos,
  type Pedido,
} from '../services/pedidos'

import './MeusPedidos.css'

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregarPedidos() {
      try {
        const resultado = await listarPedidos()

        if (ativo) {
          setPedidos(resultado)
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os pedidos.'
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

  function formatarPreco(valor: number) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR')
  }

  return (
    <main className="meus-pedidos-pagina">
      <div className="meus-pedidos-container">
        <Link to="/" className="meus-pedidos-voltar">
          <ArrowLeft size={19} />
          Voltar para a Home
        </Link>

        <div className="meus-pedidos-cabecalho">
          <div className="meus-pedidos-icone">
            <ShoppingBag size={28} />
          </div>

          <div>
            <h1>Meus Pedidos</h1>
            <p>
              Acompanhe suas compras demonstrativas
              realizadas no Mercado Local.
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="meus-pedidos-vazio">
            <Package size={46} />
            <h2>Carregando pedidos...</h2>
          </div>
        ) : erro ? (
          <div className="meus-pedidos-vazio">
            <h2>Não foi possível carregar os pedidos</h2>
            <p>{erro}</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="meus-pedidos-vazio">
            <Package size={52} />
            <h2>Você ainda não realizou pedidos</h2>
            <p>
              Explore os produtos disponíveis e faça
              sua primeira compra demonstrativa.
            </p>

            <Link to="/" className="meus-pedidos-botao">
              Explorar produtos
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <p className="meus-pedidos-contagem">
              {pedidos.length}{' '}
              {pedidos.length === 1
                ? 'pedido encontrado'
                : 'pedidos encontrados'}
            </p>

            <div className="meus-pedidos-lista">
              {pedidos.map((pedido) => (
                <article
                  className="meus-pedidos-card"
                  key={pedido.id}
                >
                  <div className="meus-pedidos-card-topo">
                    <div>
                      <span className="meus-pedidos-label">
                        Número do pedido
                      </span>
                      <h2>#{pedido.id}</h2>
                    </div>

                    <span className="meus-pedidos-status">
                      <CheckCircle size={16} />
                      {pedido.status === 'CONFIRMADO'
                        ? 'Confirmado'
                        : pedido.status}
                    </span>
                  </div>

                  <div className="meus-pedidos-card-corpo">
                    <div>
                      <span className="meus-pedidos-label">
                        <CalendarDays size={16} />
                        Data da compra
                      </span>
                      <strong>
                        {formatarData(pedido.data)}
                      </strong>
                    </div>

                    <div>
                      <span className="meus-pedidos-label">
                        Valor total
                      </span>
                      <strong className="meus-pedidos-preco">
                        {formatarPreco(pedido.total)}
                      </strong>
                    </div>
                  </div>

                  <div className="meus-pedidos-card-rodape">
                    <span>
                      Pedido demonstrativo — sem cobrança
                    </span>

                    <Link
                      to={`/pedido-sucesso/${pedido.id}`}
                      className="meus-pedidos-detalhes"
                    >
                      Ver pedido
                      <ArrowRight size={17} />
                    </Link>
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
