
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  ShoppingCart,
  Store,
  Minus,
  Plus,
  CheckCircle,
} from 'lucide-react'

import { buscarProduto } from '../services/produtos'
import { adicionarAoCarrinho } from '../services/carrinho'
import type { Anuncio } from '../services/anuncios'

import './Compras.css'

export default function DetalhesProduto() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [produto, setProduto] = useState<Anuncio | undefined>(
    undefined
  )

  const [carregando, setCarregando] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [adicionado, setAdicionado] = useState(false)
  const [erro, setErro] = useState('')

  // ========================================
  // BUSCAR PRODUTO
  // ========================================

  useEffect(() => {
    let ativo = true

    async function carregarProduto() {
      setCarregando(true)
      setProduto(undefined)
      setQuantidade(1)
      setAdicionado(false)
      setErro('')

      if (!id) {
        setCarregando(false)
        return
      }

      try {
        const produtoEncontrado = await buscarProduto(id)

        if (ativo) {
          setProduto(produtoEncontrado)
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error)

        if (ativo) {
          setErro('Não foi possível carregar o produto.')
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarProduto()

    return () => {
      ativo = false
    }
  }, [id])

  // ========================================
  // ADICIONAR AO CARRINHO
  // ========================================

  function adicionar() {
    if (!produto) return

    try {
      adicionarAoCarrinho(produto, quantidade)
      setAdicionado(true)
      setErro('')
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)

      setErro(
        'Não foi possível adicionar o produto ao carrinho.'
      )
    }
  }

  // ========================================
  // CARREGANDO
  // ========================================

  if (carregando) {
    return (
      <main className="compras-pagina">
        <div className="compras-container compras-vazio">
          <h1>Carregando produto...</h1>
          <p>Aguarde enquanto buscamos as informações.</p>
        </div>
      </main>
    )
  }

  // ========================================
  // PRODUTO NÃO ENCONTRADO
  // ========================================

  if (!produto) {
    return (
      <main className="compras-pagina">
        <div className="compras-container compras-vazio">

          <h1>Produto não encontrado</h1>

          <p>
            {erro || 'Este produto não está mais disponível.'}
          </p>

          <Link to="/" className="compras-botao">
            Voltar para a Home
          </Link>

        </div>
      </main>
    )
  }

  // ========================================
  // DETALHES DO PRODUTO
  // ========================================

  return (
    <main className="compras-pagina">
      <div className="compras-container">

        <Link to="/" className="compras-voltar">
          <ArrowLeft size={19} />
          Voltar para produtos
        </Link>

        <div className="detalhes-card">

          {/* IMAGEM */}

          <div className="detalhes-imagem">
            <img
              src={produto.imagem}
              alt={produto.nome}
            />
          </div>

          {/* INFORMAÇÕES */}

          <div className="detalhes-informacoes">

            <span className="detalhes-categoria">
              {produto.categoria}
            </span>

            <h1>{produto.nome}</h1>

            <div className="detalhes-vendedor">
              <Store size={18} />
              Vendido por {produto.vendedor}
            </div>

            <p className="detalhes-descricao">
              {produto.descricao}
            </p>

            {/* PREÇO */}

            <div className="detalhes-preco">
              {produto.preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>

            {/* QUANTIDADE */}

            <div className="detalhes-quantidade">

              <span>Quantidade</span>

              <div className="compras-contador">

                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  onClick={() =>
                    setQuantidade((atual) =>
                      Math.max(1, atual - 1)
                    )
                  }
                >
                  <Minus size={17} />
                </button>

                <strong>{quantidade}</strong>

                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  onClick={() =>
                    setQuantidade((atual) => atual + 1)
                  }
                >
                  <Plus size={17} />
                </button>

              </div>
            </div>

            {/* SUBTOTAL */}

            <p className="detalhes-subtotal">
              Subtotal:{' '}

              <strong>
                {(produto.preco * quantidade).toLocaleString(
                  'pt-BR',
                  {
                    style: 'currency',
                    currency: 'BRL',
                  }
                )}
              </strong>
            </p>

            {/* ADICIONAR AO CARRINHO */}

            <button
              type="button"
              className="compras-botao detalhes-adicionar"
              onClick={adicionar}
            >
              <ShoppingCart size={20} />
              Adicionar ao carrinho
            </button>

            {/* ERRO */}

            {erro && (
              <p className="compras-erro" role="alert">
                {erro}
              </p>
            )}

            {/* CONFIRMAÇÃO */}

            {adicionado && (
              <div
                className="compras-confirmacao"
                role="status"
              >
                <CheckCircle size={20} />
                Produto adicionado ao carrinho!
              </div>
            )}

            {/* VER CARRINHO */}

            <button
              type="button"
              className="compras-botao-secundario"
              onClick={() => navigate('/carrinho')}
            >
              Ver meu carrinho
            </button>

          </div>
        </div>
      </div>
    </main>
  )
}
