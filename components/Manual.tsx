
import React from 'react';

const Manual: React.FC = () => {
  return (
    <div className="glass-card rounded-lg p-4 sm:p-6 lg:p-8 text-gray-300">
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-white prose-a:text-primary-400 hover:prose-a:text-primary-300">
        <h1 className="text-2xl font-bold text-white mb-6">Manual de Utilização</h1>
        <p className="text-lg leading-7">
          Este manual tem como objetivo guiar você pelas funcionalidades do sistema, garantindo a correta atualização e fiscalização do quadro de especializações e licenças.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white border-b border-primary-700 pb-2 mb-4">Gerenciador de Especializações</h2>
          <p>Esta seção permite sincronizar a listagem de executivos do RCCSystem com a sua planilha de controle de forma automatizada.</p>
          <ol className="list-decimal list-inside space-y-3 mt-4">
            <li>
              <strong>Acesse o RCCSystem:</strong> No menu, vá em <em>Corpo Executivo &gt; Listagem: Especialização</em>.
            </li>
            <li>
              <strong>Copie os Dados:</strong> Selecione e copie toda a lista, começando da linha "ESPECIALIZAÇÃO AVANÇADA" até a última linha da "ESPECIALIZAÇÃO INTERMEDIÁRIA" (incluindo ativos e em licença).
            </li>
            <li>
              <strong>Importe a Lista:</strong> Volte para este aplicativo, na aba <strong>Especializações</strong>, clique no botão <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Importar Lista</code>.
            </li>
            <li>
              <strong>Cole e Analise:</strong> Na janela que abrir, cole o texto copiado (use Ctrl+V) e clique em <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Analisar Lista</code>.
            </li>
            <li>
              <strong>Revise as Alterações:</strong> O sistema exibirá uma tela de revisão com três categorias:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                <li><strong className="text-green-400">EXECUTIVOS A ADICIONAR:</strong> Novos executivos identificados na lista.</li>
                <li><strong className="text-yellow-400">EXECUTIVOS A ALTERAR:</strong> Executivos cujas informações (especialização, status) foram alteradas.</li>
                <li><strong className="text-red-400">EXECUTIVOS A REMOVER:</strong> Executivos que estão na sua planilha mas não na lista do RCCSystem.</li>
              </ul>
            </li>
            <li>
              <strong>Confirme e Sincronize:</strong> Após revisar, clique em <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Confirmar e Atualizar</code> para aplicar as mudanças. É recomendado importar a lista novamente para garantir que tudo foi sincronizado.
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white border-b border-primary-700 pb-2 mb-4">Gerenciador de Licenças</h2>
          <p>Esta seção é usada para registrar e remover licenças de especialização, mantendo o quadro sempre atualizado.</p>
          <h3 className="text-lg font-semibold text-white mt-6">Adicionando e Registrando Retornos</h3>
          <ul className="list-disc list-inside space-y-3 mt-4">
            <li>
              <strong>Adicionar Licença:</strong> Para registrar uma nova licença, clique em <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Adicionar Licença</code>, preencha os dados (executivo, início e fim) e salve.
            </li>
            <li>
              <strong>Registrar Retorno:</strong> Quando um executivo retornar, encontre a licença dele na lista e clique no botão <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Retornou</code>. Informe a data correta e salve.
            </li>
          </ul>
          
          <h3 className="text-lg font-semibold text-white mt-6">Organizando e Limpando o Quadro</h3>
           <p className="mt-2">Para manter o quadro limpo, as licenças finalizadas devem ser removidas periodicamente.</p>
          <ul className="list-disc list-inside space-y-3 mt-4">
             <li>
                <strong>Quando remover:</strong> A remoção deve ser feita geralmente no <strong>dia 01</strong> ou no <strong>dia 16</strong> de cada mês.
            </li>
            <li>
              <strong>Como remover:</strong> Clique no botão <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Organizar Dados</code>. O sistema mostrará quais licenças antigas podem ser removidas com segurança. Confirme a remoção.
            </li>
             <li>
                <strong>Mudança de Mês:</strong> Ao iniciar um novo mês, clique no ícone de lápis ao lado do "Período de Referência" para ajustar para o mês e ano corretos. Depois, use o botão <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Organizar Dados</code> para remover licenças que não se estendem para o novo período.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white border-b border-primary-700 pb-2 mb-4">Backup da Listagem</h2>
          <p>É crucial realizar o backup da listagem de especializações para manter um histórico seguro.</p>
          <ul className="list-disc list-inside space-y-3 mt-4">
            <li>
              <strong>Frequência:</strong> O backup deve ser realizado no <strong>dia 01</strong> ou no <strong>dia 16</strong> de cada mês.
            </li>
            <li>
              <strong>Como Fazer:</strong> Acesse a aba <strong>Backup</strong>, insira seu nickname no campo indicado e clique em <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Salvar Backup</code>.
            </li>
            <li>
                <strong>Verificar Backup:</strong> Você pode usar o botão <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">Abrir Planilha</code> para conferir o backup salvo na aba correspondente da sua planilha.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Manual;