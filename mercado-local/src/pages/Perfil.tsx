
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  UserRound,
  Mail,
  Phone,
  Pencil,
  ArrowLeft,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

import {
  buscarUsuarioAtual,
  sairDaConta,
} from '../services/usuario'

import type { Usuario } from '../services/usuario'

import './Perfil.css'

function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '').slice(0, 11)

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      '($1) $2-$3'
    )
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      '($1) $2-$3'
    )
  }

  return telefone
}

export default function Perfil() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [saindo, setSaindo] = useState(false)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function preencherFormulario(dados: Usuario) {
    setNome(dados.nome)
    setEmail(dados.email)
    setTelefone(formatarTelefone(dados.telefone))
  }

  useEffect(() => {
    let ativo = true

    async function carregarPerfil() {
      try {
        const dados = await buscarUsuarioAtual()

        if (ativo) {
  setUsuario(dados)

  if (dados !== null) {
    preencherFormulario(dados)
  }

  setErro('')
}
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o perfil.'
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarPerfil()

    return () => {
      ativo = false
    }
  }, [])

  function iniciarEdicao() {
    if (!usuario) return

    preencherFormulario(usuario)
    setErro('')
    setSucesso('')
    setEditando(true)
  }

  function cancelarEdicao() {
    if (usuario) {
      preencherFormulario(usuario)
    }

    setEditando(false)
    setErro('')
    setSucesso('')
  }

  async function salvarAlteracoes() {
    if (salvando) return

    setErro('')
    setSucesso('')

    const nomeLimpo = nome.trim()
    const emailLimpo = email.trim().toLowerCase()
    const telefoneLimpo = telefone.replace(/\D/g, '')

    if (!nomeLimpo || !emailLimpo || !telefoneLimpo) {
      setErro('Preencha todos os campos.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErro('Informe um e-mail válido.')
      return
    }

    if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
      setErro('Informe um telefone válido com DDD.')
      return
    }

    setSalvando(true)

    try {
      const resposta = await fetch(
        `http://${window.location.hostname}:8080/api/usuarios/me`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: nomeLimpo,
            email: emailLimpo,
            telefone: telefoneLimpo,
          }),
        }
      )

      const dados = await resposta.json().catch(() => null)

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem || 'Não foi possível atualizar o perfil.'
        )
      }

      const usuarioAtualizado = dados as Usuario

      setUsuario(usuarioAtualizado)
      preencherFormulario(usuarioAtualizado)
      setEditando(false)
      setSucesso('Informações atualizadas com sucesso!')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar as alterações.'
      )
    } finally {
      setSalvando(false)
    }
  }

  async function encerrarSessao() {
    setSaindo(true)
    setErro('')
    setSucesso('')

    try {
      await sairDaConta()

      setUsuario(null)

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível sair da conta.'
      )
    } finally {
      setSaindo(false)
    }
  }

  if (carregando) {
    return (
      <main className="perfil-pagina">
        <div className="perfil-container">
          <Link to="/" className="perfil-voltar">
            <ArrowLeft size={19} />
            Voltar para a Home
          </Link>

          <div className="perfil-titulo">
            <h1>Meu Perfil</h1>
            <p>Carregando suas informações...</p>
          </div>
        </div>
      </main>
    )
  }

  if (erro && !usuario) {
    return (
      <main className="perfil-pagina">
        <div className="perfil-container">
          <Link to="/" className="perfil-voltar">
            <ArrowLeft size={19} />
            Voltar para a Home
          </Link>

          <div className="perfil-titulo">
            <h1>Meu Perfil</h1>
            <p>{erro}</p>
          </div>

          <button
            type="button"
            className="perfil-botao-editar"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  if (!usuario) {
    return (
      <main className="perfil-pagina">
        <div className="perfil-container">
          <Link to="/" className="perfil-voltar">
            <ArrowLeft size={19} />
            Voltar para a Home
          </Link>

          <div className="perfil-titulo">
            <h1>Meu Perfil</h1>
            <p>
              Entre na sua conta para visualizar
              suas informações pessoais.
            </p>
          </div>

          <section className="perfil-card">
            <div className="perfil-topo">
              <div className="perfil-avatar">
                <UserRound size={38} />
              </div>

              <div className="perfil-identidade">
                <h2>Você não está conectado</h2>

                <p>Faça login para acessar seu perfil.</p>

                <Link
                  to="/login"
                  className="perfil-botao-editar"
                >
                  Entrar na minha conta
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="perfil-pagina">
      <div className="perfil-container">

        <Link to="/" className="perfil-voltar">
          <ArrowLeft size={19} />
          Voltar para a Home
        </Link>

        <div className="perfil-titulo">
          <h1>Meu Perfil</h1>
          <p>
            Visualize e atualize suas informações pessoais
            no Mercado Local.
          </p>
        </div>

        <section className="perfil-card">

          <div className="perfil-topo">
            <div className="perfil-avatar">
              <UserRound size={38} />
            </div>

            <div className="perfil-identidade">
              <h2>{usuario.nome}</h2>
              <p>Conta Mercado Local</p>

              <span className="perfil-selo">
                <ShieldCheck size={15} />
                Comprador e vendedor
              </span>
            </div>
          </div>

          <div className="perfil-separador" />

          <div className="perfil-secao-cabecalho">
            <div>
              <h3>Informações pessoais</h3>
              <p>
                Dados informados no cadastro
                da sua conta.
              </p>
            </div>

            {!editando && (
              <button
                type="button"
                className="perfil-botao-editar"
                onClick={iniciarEdicao}
              >
                <Pencil size={17} />
                Editar informações
              </button>
            )}
          </div>

          <div className="perfil-campos">

            <div className="perfil-grupo">
              <label htmlFor="perfil-nome">
                Nome completo
              </label>

              <div className="perfil-input">
                <UserRound size={19} />

                <input
                  id="perfil-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={!editando || salvando}
                  readOnly={!editando}
                  maxLength={150}
                />
              </div>
            </div>

            <div className="perfil-grupo">
              <label htmlFor="perfil-email">
                E-mail
              </label>

              <div className="perfil-input">
                <Mail size={19} />

                <input
                  id="perfil-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editando || salvando}
                  readOnly={!editando}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="perfil-grupo">
              <label htmlFor="perfil-telefone">
                Telefone
              </label>

              <div className="perfil-input">
                <Phone size={19} />

                <input
                  id="perfil-telefone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => {
                    const numeros = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 11)

                    setTelefone(formatarTelefone(numeros))
                  }}
                  disabled={!editando || salvando}
                  readOnly={!editando}
                  maxLength={16}
                />
              </div>
            </div>

          </div>

          {erro && (
            <p role="alert" style={{ color: '#b91c1c' }}>
              {erro}
            </p>
          )}

          {sucesso && (
            <p role="status" style={{ color: '#15803d' }}>
              {sucesso}
            </p>
          )}

          {editando && (
            <div
              className="perfil-acoes"
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                className="perfil-botao-editar"
                onClick={salvarAlteracoes}
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>

              <button
                type="button"
                className="perfil-botao-cancelar"
                onClick={cancelarEdicao}
                disabled={salvando}
              >
                Cancelar
              </button>
            </div>
          )}

          <div className="perfil-acoes">
            <button
              type="button"
              className="perfil-botao-cancelar"
              onClick={encerrarSessao}
              disabled={saindo || salvando}
            >
              <LogOut size={18} />
              {saindo ? 'Saindo...' : 'Sair da conta'}
            </button>
          </div>

        </section>

        <div className="perfil-observacao">
          <ShieldCheck size={21} />

          <p>
            Sua conta pode comprar produtos
            e publicar anúncios no Mercado Local.

            As informações são consultadas e atualizadas
            diretamente no Spring Boot, utilizando
            sua sessão autenticada.
          </p>
        </div>

      </div>
    </main>
  )
}
