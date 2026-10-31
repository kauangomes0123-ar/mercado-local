
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  ShoppingBag,
  UserRound,
} from 'lucide-react'

import {
  listarCarrinho,
  calcularTotal,
  limparCarrinho,
  type ItemCarrinho,
} from '../services/carrinho'

import {
  criarPedido,
  type DadosComprador,
} from '../services/pedidos'

import './Checkout.css'

const dadosIniciais: DadosComprador = {
  nome: '',
  telefone: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  complemento: '',
}

export default function Checkout() {
  const navigate = useNavigate()

  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [carregando, setCarregando] = useState(true)

  const [dados, setDados] = useState<DadosComprador>(
    dadosIniciais
  )

  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState(false)

  const total = calcularTotal(itens)

  useEffect(() => {
    let ativo = true

    async function carregarCarrinho() {
      try {
        const produtos = await listarCarrinho()

        if (ativo) {
          setItens(produtos)
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

    carregarCarrinho()

    return () => {
      ativo = false
    }
  }, [])

  function atualizarCampo(
    campo: keyof DadosComprador,
    valor: string
  ) {
    setDados((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  async function finalizarPedido(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault()

    if (processando) return

    if (itens.length === 0) {
      setErro(
        'Adicione produtos ao carrinho antes de finalizar.'
      )
      return
    }

    const obrigatorios: (keyof DadosComprador)[] = [
      'nome',
      'telefone',
      'endereco',
      'numero',
      'bairro',
      'cidade',
    ]

    if (obrigatorios.some((campo) => !dados[campo].trim())) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    const telefoneNumeros = dados.telefone.replace(/\D/g, '')

    if (
      telefoneNumeros.length < 10 ||
      telefoneNumeros.length > 11
    ) {
      setErro('Digite um telefone válido com DDD.')
      return
    }

    setErro('')
    setProcessando(true)

    try {
      const pedido = await criarPedido(dados, itens)

      // O pedido já foi confirmado pelo backend.
      // Agora podemos limpar o carrinho.
      try {
        await limparCarrinho()
      } catch (erroLimpeza) {
        console.error(
          'Pedido registrado, mas não foi possível limpar o carrinho:',
          erroLimpeza
        )
      }

      navigate(`/pedido-sucesso/${pedido.id}`, {
        replace: true,
      })
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o pedido.'
      )
    } finally {
      setProcessando(false)
    }
  }

  if (carregando) {
    return (
      <main className="checkout-pagina">
        <div className="checkout-container checkout-vazio">
          <h1>Carregando seu pedido...</h1>
          <p>Aguarde enquanto buscamos seus produtos.</p>
        </div>
      </main>
    )
  }

  if (itens.length === 0) {
    return (
      <main className="checkout-pagina">
        <div className="checkout-container checkout-vazio">
          <ShoppingBag size={48} color="#138e68" />

          <h1>Seu carrinho está vazio</h1>

          {erro && (
            <p className="checkout-erro" role="alert">
              {erro}
            </p>
          )}

          <p>
            Adicione produtos antes de finalizar seu pedido.
          </p>

          <Link to="/" className="checkout-botao">
            Explorar produtos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-pagina">
      <div className="checkout-container">
        <Link to="/carrinho" className="checkout-voltar">
          <ArrowLeft size={19} />
          Voltar ao carrinho
        </Link>

        <div className="checkout-cabecalho">
          <h1>Finalizar pedido</h1>

          <p>
            Confira seus produtos e preencha os dados para
            confirmar o pedido demonstrativo.
          </p>
        </div>

        <form
          className="checkout-layout"
          onSubmit={finalizarPedido}
        >
          <div className="checkout-formularios">
            <section className="checkout-card">
              <h2>
                <UserRound size={23} />
                Dados do comprador
              </h2>

              <div className="checkout-campos">
                <label className="checkout-campo">
                  Nome completo *
                  <input
                    type="text"
                    value={dados.nome}
                    onChange={(e) =>
                      atualizarCampo('nome', e.target.value)
                    }
                    placeholder="Digite seu nome"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="checkout-campo">
                  Telefone com DDD *
                  <input
                    type="tel"
                    value={dados.telefone}
                    onChange={(e) =>
                      atualizarCampo('telefone', e.target.value)
                    }
                    placeholder="(17) 99999-9999"
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>
            </section>

            <section className="checkout-card">
              <h2>
                <MapPin size={23} />
                Informações de entrega
              </h2>

              <p className="checkout-aviso">
                Para esta demonstração, utilize dados fictícios.
                Nenhuma entrega será realizada.
              </p>

              <div className="checkout-campos">
                <label className="checkout-campo">
                  Endereço *
                  <input
                    type="text"
                    value={dados.endereco}
                    onChange={(e) =>
                      atualizarCampo('endereco', e.target.value)
                    }
                    placeholder="Rua ou avenida"
                    required
                  />
                </label>

                <div className="checkout-duas-colunas">
                  <label className="checkout-campo">
                    Número *
                    <input
                      type="text"
                      value={dados.numero}
                      onChange={(e) =>
                        atualizarCampo('numero', e.target.value)
                      }
                      placeholder="123"
                      required
                    />
                  </label>

                  <label className="checkout-campo">
                    Bairro *
                    <input
                      type="text"
                      value={dados.bairro}
                      onChange={(e) =>
                        atualizarCampo('bairro', e.target.value)
                      }
                      placeholder="Centro"
                      required
                    />
                  </label>
                </div>

                <label className="checkout-campo">
                  Cidade *
                  <input
                    type="text"
                    value={dados.cidade}
                    onChange={(e) =>
                      atualizarCampo('cidade', e.target.value)
                    }
                    placeholder="Sua cidade"
                    required
                  />
                </label>

                <label className="checkout-campo">
                  Complemento (opcional)
                  <input
                    type="text"
                    value={dados.complemento}
                    onChange={(e) =>
                      atualizarCampo('complemento', e.target.value)
                    }
                    placeholder="Casa, apartamento, referência..."
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="checkout-card checkout-resumo">
            <h2>
              <ShoppingBag size={23} />
              Resumo do pedido
            </h2>

            <div className="checkout-itens">
              {itens.map((item) => (
                <div
                  className="checkout-item"
                  key={item.produto.id}
                >
                  <img
                    src={item.produto.imagem}
                    alt={item.produto.nome}
                  />

                  <div>
                    <strong>{item.produto.nome}</strong>

                    <span>
                      Quantidade: {item.quantidade}
                    </span>

                    <span>
                      {(
                        item.produto.preco * item.quantidade
                      ).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>Total estimado</span>

              <strong>
                {total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </div>

            <p className="checkout-aviso">
              Os preços finais serão confirmados pelo
              servidor. Esta é uma simulação, sem
              pagamento ou entrega real.
            </p>

            {erro && (
              <p className="checkout-erro" role="alert">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="checkout-botao"
              disabled={processando}
            >
              <CheckCircle size={20} />

              {processando
                ? 'Registrando pedido...'
                : 'Confirmar pedido demonstrativo'}
            </button>
          </aside>
        </form>
      </div>
    </main>
  )
}
