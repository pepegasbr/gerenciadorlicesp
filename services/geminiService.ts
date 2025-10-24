import { GoogleGenAI } from "@google/genai";
import type { Executive, License } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePrompt = (): string => {
  return `
    Você é um desenvolvedor expert em Google Apps Script. Crie um script completo que funcionará como uma API de backend para uma aplicação web. O script irá gerenciar dados em uma Planilha Google.

    O script deve ser implantado como um Aplicativo Web e manipular requisições GET e POST.

    **ESPECIFICAÇÕES:**

    1.  **Constantes Globais:**
        *   Defina constantes para os nomes das abas: \`SPECIALIZATIONS_SHEET_NAME = "Quadro de Especializações"\`, \`LICENSES_SHEET_NAME = "Quadro de Licenças"\`, \`BACKUP_SHEET_NAME = "Backup de Especializações"\`, e \`CONFIG_SHEET_NAME = "Config"\`.

    2.  **Função \`doGet(e)\`:**
        *   Esta função será acionada por requisições HTTP GET.
        *   Deve ler todos os dados das abas "Quadro de Especializações" e "Quadro de Licenças".
        *   **Deve também ler o período de referência (mês e ano) da aba "Config".** Se a aba "Config" ou os valores não existirem, o script deve usar o mês e ano atuais como padrão (mês por extenso em português) e **salvar esses padrões na aba "Config"** para inicialização.
        *   Deve retornar um objeto JSON de sucesso com a estrutura: \`{ status: "success", data: { executives: [...], licenses: [...], referenceMonth: "...", referenceYear: ... } }\`.
        *   Garanta que todas as datas lidas da planilha sejam formatadas como strings "YYYY-MM-DD" no JSON de retorno.
        *   A estrutura para cada executivo deve ser: \`{ id, nickname, specialization, concessionDate, status }\`.
        *   A estrutura para cada licença deve ser: \`{ id, executiveNickname, startDate, endDate, returnDate }\`. O valor para \`executiveNickname\` deve ser lido da coluna 'Executive_ID'.
        *   A função deve retornar os dados usando \`ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON)\`.
        *   Em caso de erro, deve retornar um JSON de erro.

    3.  **Função \`doPost(e)\`:**
        *   Esta função será acionada por requisições HTTP POST. O corpo da requisição será uma string JSON.
        *   Deve fazer o parse do JSON de \`e.postData.contents\`.
        *   O objeto parseado conterá uma string \`action\` e um objeto \`payload\`.
        *   Implemente um bloco \`switch\` baseado no valor de \`action\` para realizar operações CRUD e de backup.
        *   **Ações Requeridas:**
            *   \`ADD_EXECUTIVE\`: payload será \`{ nickname, specialization, concessionDate, status }\`. Adicione uma nova linha à "Quadro de Especializações". O \`id\` deve ser um UUID gerado. Se o \`status\` não for fornecido, o padrão deve ser 'ativo'. Os status podem ser 'ativo', 'inativo' ou 'licença'.
            *   \`UPDATE_EXECUTIVE\`: payload será \`{ id, nickname, specialization, concessionDate, status }\`. Encontre a linha pelo \`id\` e atualize seu conteúdo.
            *   \`DELETE_EXECUTIVE\`: payload será \`{ id }\`. Busque na aba "Quadro de Especializações". Itere pelas linhas (ignorando o cabeçalho) para encontrar a linha onde o valor na coluna "ID" (a primeira coluna) corresponde ao \`payload.id\`. Se encontrada, remova essa linha usando \`sheet.deleteRow(rowIndex)\`. Retorne um sucesso mesmo se o ID não for encontrado (operação idempotente).
            *   \`ADD_LICENSE\`: payload será \`{ executiveNickname, startDate, endDate, returnDate }\`. Adicione uma nova linha à "Quadro de Licenças". O \`id\` deve ser um UUID gerado. O valor de \`executiveNickname\` deve ser salvo na coluna 'Executive_ID'.
            *   \`UPDATE_LICENSE\`: payload será \`{ id, ...data }\`. Encontre a linha pelo \`id\` e atualize-a. O valor de \`executiveNickname\` deve ser salvo na coluna 'Executive_ID'.
            *   \`DELETE_LICENSE\`: payload será \`{ id }\`. Busque na aba "Quadro de Licenças". Itere pelas linhas (ignorando o cabeçalho) para encontrar a linha onde o valor na coluna "ID" (a primeira coluna) corresponde ao \`payload.id\`. Se encontrada, remova essa linha usando \`sheet.deleteRow(rowIndex)\`. Retorne um sucesso mesmo se o ID não for encontrado (operação idempotente).
            *   **\`UPDATE_REFERENCE_PERIOD\`**: O payload será \`{ month: string, year: number }\`.
                *   Acesse a aba "Config".
                *   Encontre as chaves "referenceMonth" e "referenceYear" na coluna A e atualize seus valores na coluna B com os dados do payload. Se as chaves não existirem, adicione-as.
            *   **\`CREATE_BACKUP\`**: O payload será \`{ nickname: string, executives: Executive[] }\`.
                *   Acesse a aba "Backup de Especializações".
                *   Crie um timestamp no formato 'dd/MM/yyyy HH:mm:ss'.
                *   Crie uma string de cabeçalho, ex: "Backup realizado por: [nickname] em [timestamp]".
                *   **Anexe** (append) o seguinte à planilha: uma linha em branco, a linha de cabeçalho do backup (mesclando as colunas para melhor visualização), uma linha com os cabeçalhos da tabela (["Nickname", "Especialização", "Data de Concessão", "Status"]), e então as linhas com os dados de cada executivo do array \`executives\`. **Nunca sobrescreva backups antigos.**
        *   A função deve retornar uma resposta JSON de sucesso: \`{ "status": "success", "data": ... }\`.
        *   Manipule erros de forma elegante e retorne uma resposta de erro: \`{ "status": "error", "message": "..." }\`.

    4.  **Funções Auxiliares:**
        *   Crie uma função \`getSheet(name, headers)\` que obtém uma aba pelo nome. Se não existir, ela a cria e adiciona a linha de cabeçalho especificada (se headers for fornecido).
        *   Cabeçalhos para "Quadro de Especializações": \`["ID", "Nickname", "Especialização", "Data de Concessão", "Status"]\`
        *   Cabeçalhos para "Quadro de Licenças": \`["ID", "Executive_ID", "Início da Licença", "Fim da Licença", "Data de Retorno"]\` (IMPORTANTE: A coluna "Executive_ID" armazenará o NICKNAME, não o ID).
        *   Cabeçalhos para "Config": \`["Chave", "Valor"]\`
        *   Use \`Utilities.getUuid()\` para gerar IDs únicos.
        *   Use \`LockService.getScriptLock()\` para operações de escrita para prevenir condições de corrida.

    5.  **Formatação de Data na Planilha:**
        *   Crie uma função auxiliar para formatar visualmente as células de data.
        *   Essa função deve aplicar o formato de número \`dd" "mmm" "yyyy\` às colunas de data ("Data de Concessão", "Início da Licença", "Fim da Licença", "Data de Retorno").
        *   **IMPORTANTE**: Chame esta função de formatação sempre após adicionar ou atualizar uma linha que contenha uma data, para garantir que a exibição na planilha esteja correta. Os dados enviados e recebidos pela API devem continuar no formato "YYYY-MM-DD". A formatação é apenas visual, na planilha.

    6.  **Instruções de Implantação (em comentários no topo do script):**
        *   Inclua um comentário claro no topo do arquivo explicando como implantar o script como um Aplicativo Web no Google Apps Script, com as configurações "Executar como: Eu" e "Quem pode acessar: Qualquer pessoa".
        
    7.  **Função de Gatilho \`onEdit(e)\` (Automação da Planilha):**
        *   Implemente uma função \`onEdit(e)\` que será acionada automaticamente quando um usuário editar a planilha.
        *   **Cenário 1: Nova Especialização**
            *   **Condição:** Se um usuário preencher um NICKNAME (Coluna B) na aba "Quadro de Especializações" e a célula de ID (Coluna A) da mesma linha estiver VAZIA.
            *   **Ação:** O script deve preencher automaticamente a Coluna A com um novo UUID (\`Utilities.getUuid()\`) e a Coluna E (Status) com o valor "ativo".
        *   **Cenário 2: Nova Licença**
            *   **Condição:** Se um usuário preencher o NICKNAME do executivo (Coluna B, 'Executive_ID') na aba "Quadro de Licenças" e a célula de ID (Coluna A) da mesma linha estiver VAZIA.
            *   **Ação:** O script deve preencher automaticamente a Coluna A com um novo UUID (\`Utilities.getUuid()\`) para a licença.
        *   A função deve verificar a aba e a coluna editada para garantir que as ações sejam executadas apenas nos cenários corretos. Deve também ignorar edições no cabeçalho.


    O script deve ser completo, robusto, bem comentado e pronto para ser copiado e colado no editor de Apps Script do Google.
  `;
};

export const generateAppScript = async (): Promise<string> => {
  try {
    const prompt = generatePrompt();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using a more powerful model for complex script generation
      contents: prompt,
    });
    
    const scriptText = response.text;
    // Clean up markdown code block fences if they exist
    return scriptText.replace(/^```(javascript|js|appsscript)\s*|```\s*$/g, '').trim();
  } catch (error) {
    console.error("Error generating Google Apps Script:", error);
    if (error instanceof Error) {
      return `Ocorreu um erro ao gerar o script: ${error.message}. Verifique se a chave de API está configurada corretamente no ambiente.`;
    }
    return "Ocorreu um erro desconhecido ao gerar o script.";
  }
};