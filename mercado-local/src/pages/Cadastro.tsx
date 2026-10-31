
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Store,
  UserRound,
} from 'lucide-react'

import { cadastrarUsuario } from '../services/usuario'
import './Auth.css'

export default function Cadastro() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')

    if (carregando) return

    if (
      !nome.trim() ||
      !email.trim() ||
      !telefone.trim() ||
      !senha ||
      !confirmarSenha
    ) {
      setErro('Preencha todos os campos.')
      return
    }

    if (nome.trim().length < 3) {
      setErro('O nome deve possuir pelo menos 3 caracteres.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.')
      return
    }

    const telefoneNumeros = telefone.replace(/\D/g, '')

    if (
      telefoneNumeros.length !== 10 &&
      telefoneNumeros.length !== 11
    ) {
      setErro('Informe um telefone válido com DDD.')
      return
    }

    if (
      senha.length < 8 ||
      !/[A-Z]/.test(senha) ||
      !/[a-z]/.test(senha) ||
      !/[0-9]/.test(senha) ||
      !/[^A-Za-z0-9]/.test(senha)
    ) {
      setErro(
        'A senha deve ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e símbolo.'
      )
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefoneNumeros,
        senha,
      })

      alert('Conta criada com sucesso! Agora você pode fazer login.')
      navigate('/login')
    } catch (erroCapturado) {
      if (erroCapturado instanceof TypeError) {
        setErro(
          'Não foi possível conectar ao servidor. Verifique se o Spring Boot está funcionando.'
        )
      } else if (erroCapturado instanceof Error) {
        setErro(erroCapturado.message)
      } else {
        setErro('Ocorreu um erro ao realizar o cadastro.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth-pagina">
      <section className="auth-card">
        <div className="auth-icone">
          <Store size={30} />
        </div>

        <h1>Crie sua conta</h1>

        <p className="auth-descricao">
          Uma única conta para comprar e vender no Mercado Local.
        </p>

        <form onSubmit={cadastrar} noValidate>
          <label htmlFor="cadastro-nome">
            Nome completo
          </label>

          <div className="auth-campo">
            <UserRound size={19} />
            <input
              id="cadastro-nome"
              type="text"
              placeholder="Digite seu nome completo"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={carregando}
            />
          </div>

          <label htmlFor="cadastro-email">
            E-mail
          </label>

          <div className="auth-campo">
            <Mail size={19} />
            <input
              id="cadastro-email"
              type="email"
              placeholder="Digite seu e-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={carregando}
            />
          </div>

          <label htmlFor="cadastro-telefone">
            Telefone
          </label>

          <div className="auth-campo">
            <Phone size={19} />
            <input
              id="cadastro-telefone"
              type="tel"
              placeholder="(17) 99999-9999"
              autoComplete="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              disabled={carregando}
            />
          </div>

          <label htmlFor="cadastro-senha">
            Senha
          </label>

          <div className="auth-campo">
            <LockKeyhole size={19} />
            <input
              id="cadastro-senha"
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Crie uma senha"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />

            <button
              type="button"
              className="auth-mostrar-senha"
              aria-label={
                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
              }
              onClick={() => setMostrarSenha(!mostrarSenha)}
              disabled={carregando}
            >
              {mostrarSenha ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          <p className="auth-dica">
            Mínimo de 8 caracteres, incluindo maiúscula,
            minúscula, número e símbolo.
          </p>

          <label htmlFor="cadastro-confirmar">
            Confirmar senha
          </label>

          <div className="auth-campo">
            <LockKeyhole size={19} />
            <input
              id="cadastro-confirmar"
              type="password"
              placeholder="Confirme sua senha"
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={carregando}
            />
          </div>

          {erro && (
            <p className="auth-erro" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="auth-botao"
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-rodape">
          Já possui uma conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>

        <Link to="/" className="auth-voltar">
          Voltar para a Home
        </Link>
      </section>
    </main>
  )
}
