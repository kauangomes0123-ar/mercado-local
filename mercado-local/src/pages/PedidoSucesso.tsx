
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  CalendarDays,
} from 'lucide-react'

import {
  buscarPedido,
  type Pedido,
} from '../services/pedidos'

import './Checkout.css'

export default function PedidoSucesso() {
  const { id } = useParams()

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregarPedido() {
      setCarregando(true)
      setErro('')
      setPedido(null)

      if (!id) {
        setErro('Número do pedido não informado.')
        setCarregando(false)
        return
      }

      try {
        const pedidoEncontrado = await buscarPedido(id)

        if (ativo) {
          setPedido(pedidoEncontrado)
        }
      } catch (error) {
        console.error('Erro ao consultar pedido:', error)

        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível consultar o pedido.'
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarPedido()

    return () => {
      ativo = false
    }
  }, [id])

  // ========================================
  // CARREGANDO
  // ========================================

  if (carregando) {
    return (
      <main className="checkout-pagina">
        <div className="checkout-container checkout-vazio">
          <ShoppingBag size={48} color="#138e68" />

          <h1>Consultando pedido...</h1>

          <p>
            Aguarde enquanto buscamos as informações
            no servidor.
          </p>
        </div>
      </main>
    )
  }

  // ========================================
  // PEDIDO NÃO ENCONTRADO
  // ========================================

  if (!pedido) {
    return (
      <main className="checkout-pagina">
        <div className="checkout-container checkout-vazio">
          <ShoppingBag size={48} color="#138e68" />

          <h1>Pedido não encontrado</h1>

          <p>
            {erro ||
              'Não foi possível localizar esse pedido no banco de dados.'}
          </p>

          <Link to="/" className="checkout-botao">
            Voltar para a Home
          </Link>
        </div>
      </main>
    )
  }

  // ========================================
  // PEDIDO CONFIRMADO
  // ========================================

  return (
    <main className="checkout-pagina">
      <div className="pedido-sucesso">
        <CheckCircle
          size={75}
          color="#138e68"
          strokeWidth={1.5}
        />

        <h1>Pedido confirmado!</h1>

        <p>
          Sua compra demonstrativa foi registrada
          com sucesso no sistema.
        </p>

        <span className="pedido-etiqueta">
          Simulação concluída — sem cobrança
        </span>

        <div className="pedido-dados">
          <div>
            <span>Número do pedido</span>

            <strong>#{pedido.id}</strong>
          </div>

          <div>
            <span>
              <CalendarDays size={16} />
              Data
            </span>

            <strong>
              {new Date(pedido.data).toLocaleString('pt-BR')}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong>
              {pedido.status === 'CONFIRMADO'
                ? 'Confirmado'
                : pedido.status}
            </strong>
          </div>

          <div>
            <span>
              <ShoppingBag size={16} />
              Valor total
            </span>

            <strong>
              {Number(pedido.total).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </strong>
          </div>
        </div>

        <div className="pedido-observacao">
          Este pedido foi registrado no banco de dados
          PostgreSQL e está vinculado à sua conta.
          Nenhuma compra real, cobrança ou entrega
          será realizada.
        </div>

        <Link to="/" className="checkout-botao">
          Voltar para a Home
          <ArrowRight size={19} />
        </Link>
      </div>
    </main>
  )
}
