const readline = require('readline');


class Usuario {
  constructor(id, nome, email, cpf, senha, sexo, dataNascimento, idade, telefone) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.senha = senha;
    this.sexo = sexo;
    this.dataNascimento = dataNascimento;
    this.idade = idade;
    this.telefone = telefone;
  }
}



function formatarCPF(cpf) {
    let numeros = cpf.replace(/\D/g, "");
  
    if (numeros.length < 11) {
      console.log("❌ CPF precisa ter 11 números!");
      return null;
    }
  
    
    numeros = numeros.slice(0, 11);
  
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

function formatarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 12 || numeros.length === 13) {
    return numeros.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, "($1) $2$3-$4");
  }

  if (numeros.length === 10 || numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return null;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarSenha(senha) {
  const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
  return regex.test(senha);
}

function validarSexo(sexo) {
  const s = sexo.toLowerCase();
  return s === "masculino" || s === "feminino";
}

function validarDataNascimento(data) {
  const numeros = data.replace(/\D/g, "");
  return numeros.length === 8;
}

function validarIdade(idade) {
  return /^\d{1,3}$/.test(idade);
}



class UsuarioService {
  constructor() {
    this.usuarios = [];
    this.contador = 1;
  }

  listarUsuarios() {
    console.log("\n📋 Lista de Usuários:");
    this.usuarios.forEach(u => {
      console.log(
        `ID: ${u.id} | Nome: ${u.nome} | Email: ${u.email} | CPF: ${u.cpf} | Sexo: ${u.sexo} | Idade: ${u.idade} | Tel: ${u.telefone}`
      );
    });
  }

  adicionarUsuario(nome, email, cpf, senha, sexo, dataNascimento, idade, telefone) {

    const cpfFormatado = formatarCPF(cpf);
    if (!cpfFormatado) {
      console.log("❌ CPF inválido!");
      return;
    }

    const telefoneFormatado = formatarTelefone(telefone);
    if (!telefoneFormatado) {
      console.log("❌ Telefone inválido!");
      return;
    }

    if (!validarEmail(email)) {
      console.log("❌ Email inválido!");
      return;
    }

    if (!validarSenha(senha)) {
      console.log("❌ Senha inválida!");
      return;
    }

    if (!validarSexo(sexo)) {
      console.log("❌ Sexo inválido!");
      return;
    }

    if (!validarDataNascimento(dataNascimento)) {
      console.log("❌ Data inválida!");
      return;
    }

    if (!validarIdade(idade)) {
      console.log("❌ Idade inválida!");
      return;
    }

    const usuario = new Usuario(
      this.contador++,
      nome,
      email,
      cpfFormatado,
      senha,
      sexo,
      dataNascimento,
      Number(idade),
      telefoneFormatado
    );

    this.usuarios.push(usuario);
    console.log("✅ Usuário adicionado com sucesso!");
  }

  editarUsuario(id, nome, email, cpf, senha, sexo, dataNascimento, idade, telefone) {

    const cpfFormatado = formatarCPF(cpf);
    const telefoneFormatado = formatarTelefone(telefone);

    if (!cpfFormatado || !telefoneFormatado ||
        !validarEmail(email) ||
        !validarSenha(senha) ||
        !validarSexo(sexo) ||
        !validarDataNascimento(dataNascimento) ||
        !validarIdade(idade)) {

      console.log("❌ Dados inválidos!");
      return;
    }

    const usuario = this.usuarios.find(u => u.id === id);

    if (usuario) {
      usuario.nome = nome;
      usuario.email = email;
      usuario.cpf = cpfFormatado;
      usuario.senha = senha;
      usuario.sexo = sexo;
      usuario.dataNascimento = dataNascimento;
      usuario.idade = Number(idade);
      usuario.telefone = telefoneFormatado;

      console.log("✏️ Usuário atualizado!");
    } else {
      console.log("❌ Usuário não encontrado!");
    }
  }

  deletarUsuario(id) {
    this.usuarios = this.usuarios.filter(u => u.id !== id);
    console.log("🗑️ Usuário removido!");
  }
}



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const service = new UsuarioService();

function menu() {
  console.log("\n===== MENU =====");
  console.log("1 - Listar usuários");
  console.log("2 - Adicionar usuário");
  console.log("3 - Editar usuário");
  console.log("4 - Deletar usuário");
  console.log("0 - Sair");

  rl.question("Escolha: ", (opcao) => {
    switch (opcao) {

      case "1":
        service.listarUsuarios();
        menu();
        break;

      case "2":
        rl.question("Nome: ", nome => {
          rl.question("Email: ", email => {
            rl.question("CPF (só números): ", cpf => {
              rl.question("Senha: ", senha => {
                rl.question("Sexo (masculino/feminino): ", sexo => {
                  rl.question("Data nascimento (05051990): ", data => {
                    rl.question("Idade: ", idade => {
                      rl.question("Telefone (com ou sem 55): ", telefone => {

                        service.adicionarUsuario(
                          nome, email, cpf, senha, sexo, data, idade, telefone
                        );

                        menu();
                      });
                    });
                  });
                });
              });
            });
          });
        });
        break;

      case "3":
        rl.question("ID: ", id => {
          rl.question("Nome: ", nome => {
            rl.question("Email: ", email => {
              rl.question("CPF: ", cpf => {
                rl.question("Senha: ", senha => {
                  rl.question("Sexo: ", sexo => {
                    rl.question("Data: ", data => {
                      rl.question("Idade: ", idade => {
                        rl.question("Telefone: ", telefone => {

                          service.editarUsuario(
                            Number(id), nome, email, cpf, senha, sexo, data, idade, telefone
                          );

                          menu();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
        break;

      case "4":
        rl.question("ID: ", id => {
          service.deletarUsuario(Number(id));
          menu();
        });
        break;

      case "0":
        console.log("👋 Saindo...");
        rl.close();
        break;

      default:
        console.log("❌ Opção inválida!");
        menu();
    }
  });
}

menu();