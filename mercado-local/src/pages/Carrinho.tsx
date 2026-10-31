
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
} from 'lucide-react'

import {
  listarCarrinho,
  alterarQuantidade,
  removerDoCarrinho,
  calcularTotal,
  type ItemCarrinho,
} from '../services/carrinho'

import './Compras.css'

export default function Carrinho() {
  const navigate = useNavigate()

  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const dados = await listarCarrinho()

        if (ativo) {
          setItens(dados)
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o carrinho.'
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  async function atualizarQuantidade(
    id: string,
    quantidade: number
  ) {
    if (processando) return

    setProcessando(true)
    setErro('')

    try {
      if (quantidade < 1) {
        await removerDoCarrinho(id)
      } else {
        await alterarQuantidade(id, quantidade)
      }

      setItens(await listarCarrinho())
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o carrinho.'
      )
    } finally {
      setProcessando(false)
    }
  }

  async function remover(id: string) {
    if (processando) return

    setProcessando(true)
    setErro('')

    try {
      await removerDoCarrinho(id)
      setItens(await listarCarrinho())
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível remover o produto.'
      )
    } finally {
      setProcessando(false)
    }
  }

  const total = calcularTotal(itens)

  const quantidadeTotal = itens.reduce(
    (soma, item) => soma + item.quantidade,
    0
  )

  function finalizarPedido() {
    if (itens.length === 0 || processando) return
    navigate('/checkout')
  }

  return (
    <main className="compras-pagina">
      <div className="compras-container">
        <Link to="/" className="compras-voltar">
          <ArrowLeft size={19} />
          Continuar comprando
        </Link>

        <div className="carrinho-titulo">
          <h1>
            <ShoppingCart size={30} />
            Meu Carrinho
          </h1>
          <p>
            Confira os produtos selecionados antes de finalizar.
          </p>
        </div>

        {erro && (
          <p className="compras-erro" role="alert">
            {erro}
          </p>
        )}

        {carregando ? (
          <div className="compras-vazio">
            <p>Carregando seu carrinho...</p>
          </div>
        ) : itens.length === 0 ? (
          <div className="compras-vazio">
            <ShoppingCart size={48} />
            <h2>Seu carrinho está vazio</h2>

            <p>
              Explore os produtos e encontre algo especial!
            </p>

            <Link to="/" className="compras-botao">
              Explorar produtos
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="carrinho-layout">
            <section className="carrinho-lista">
              {itens.map((item) => (
                <article
                  className="carrinho-item"
                  key={item.produto.id}
                >
                  <img
                    src={item.produto.imagem}
                    alt={item.produto.nome}
                  />

                  <div className="carrinho-item-info">
                    <h2>{item.produto.nome}</h2>

                    <p>{item.produto.vendedor}</p>

                    <strong>
                      {item.produto.preco.toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                        }
                      )}
                    </strong>

                    <div className="carrinho-item-acoes">
                      <div className="compras-contador">
                        <button
                          type="button"
                          disabled={processando}
                          aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                          onClick={() =>
                            atualizarQuantidade(
                              item.produto.id,
                              item.quantidade - 1
                            )
                          }
                        >
                          <Minus size={16} />
                        </button>

                        <strong>{item.quantidade}</strong>

                        <button
                          type="button"
                          disabled={processando}
                          aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                          onClick={() =>
                            atualizarQuantidade(
                              item.produto.id,
                              item.quantidade + 1
                            )
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="carrinho-remover"
                        disabled={processando}
                        onClick={() =>
                          remover(item.produto.id)
                        }
                      >
                        <Trash2 size={17} />
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="carrinho-resumo">
              <h2>Resumo do pedido</h2>

              <div className="carrinho-resumo-linha">
                <span>Itens</span>
                <span>{quantidadeTotal}</span>
              </div>

              <div className="carrinho-resumo-linha">
                <span>Subtotal</span>
                <span>
                  {total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>

              <div className="carrinho-resumo-total">
                <span>Total</span>
                <strong>
                  {total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>

              <p className="carrinho-aviso">
                Pedido demonstrativo. Nenhuma cobrança será realizada.
              </p>

              <button
                type="button"
                className="compras-botao"
                onClick={finalizarPedido}
                disabled={processando}
              >
                Finalizar pedido
                <ArrowRight size={18} />
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
