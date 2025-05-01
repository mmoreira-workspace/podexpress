import { produtos } from '../../produtos.js';

function separarBlocosPorClienteTopDown(input) {
    const todasAsLinhas = input.split('\n');
    let blocos = [];
    let linhasDoBlocoAtual = [];

    for (let i = 0; i < todasAsLinhas.length; i++) {
        const linhaOriginal = todasAsLinhas[i].trim();

        if (linhaOriginal.match(/^\*?\s*Cliente:\s*.+/i)) {
            const nomeCliente = linhaOriginal.replace(/^Cliente:\s*/i, '').trim();

            blocos.push({
                cliente: nomeCliente,
                linhas: linhasDoBlocoAtual
            });

            linhasDoBlocoAtual = [];
        } else {
            linhasDoBlocoAtual.push(linhaOriginal);
        }
    }

    if (linhasDoBlocoAtual.length > 0) {
        blocos.push({
            cliente: 'SemCliente',
            linhas: linhasDoBlocoAtual
        });
    }

    return blocos;
}

function processarBlocoDeLinhas(bloco, estruturas, config) {
    let tamanhoAtual = null;

    const tamanhosValidos = config.tamanhosValidos
        .map(t => t.toUpperCase().replace(/\s+/g, ' '))
        .sort((a, b) => b.length - a.length);

    const tamanhosValidosSet = new Set(tamanhosValidos);

    if (!estruturas.clientes[bloco.cliente]) {
        estruturas.clientes[bloco.cliente] = {
            sabores: {},
            totaisTamanhos: {},
            pedidos: []
        };
    }

    bloco.linhas.forEach(linhaOriginal => {
        let linhaProcessada = linhaOriginal
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, ' ');


        const possivelTamanho = Array.from(tamanhosValidos).find(t => {
            const regex = new RegExp(`\\b${t.replace(/\s+/g, '\\s*')}\\b`, 'i');
            return regex.test(linhaProcessada);
        });

        if (possivelTamanho) {
            tamanhoAtual = possivelTamanho;

            estruturas.totaisTamanhos[tamanhoAtual] =
                (estruturas.totaisTamanhos[tamanhoAtual] || 0);
            estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] =
                (estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] || 0);

            estruturas.clientes[bloco.cliente].pedidos.push({
                tamanho: tamanhoAtual,
                valor: linhaOriginal.match(/\d+[\d,.]*/) ? linhaOriginal.match(/\d+[\d,.]*/)[0] : '',
                itens: []
            });

            return;
        }

        if (tamanhoAtual && tamanhosValidosSet.has(tamanhoAtual)) {
            let matchVenda = linhaOriginal.match(/^\s*(\d+)\s+([\w.\s]+.*?)\s*$/i);

            if (matchVenda) {
                const [_, quantidadeStr, saborBruto] = matchVenda;
                const quantidade = parseInt(quantidadeStr, 10);

                let sabor = saborBruto
                    .replace(/[^A-Za-z0-9%\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toUpperCase();

                Object.entries(config.variacoesSabores).forEach(([errado, certo]) => {
                    sabor = sabor.replace(new RegExp(errado, 'gi'), certo.toUpperCase());
                });

                if (!estruturas.sabores[sabor]) {
                    estruturas.sabores[sabor] = { tamanhos: {}, total: 0 };
                }
                estruturas.sabores[sabor].tamanhos[tamanhoAtual] =
                    (estruturas.sabores[sabor].tamanhos[tamanhoAtual] || 0) + quantidade;
                estruturas.sabores[sabor].total += quantidade;

                estruturas.totaisTamanhos[tamanhoAtual] =
                    (estruturas.totaisTamanhos[tamanhoAtual] || 0) + quantidade;

                if (!estruturas.clientes[bloco.cliente].sabores[sabor]) {
                    estruturas.clientes[bloco.cliente].sabores[sabor] = { tamanhos: {}, total: 0 };
                }
                estruturas.clientes[bloco.cliente].sabores[sabor].tamanhos[tamanhoAtual] =
                    (estruturas.clientes[bloco.cliente].sabores[sabor].tamanhos[tamanhoAtual] || 0) + quantidade;
                estruturas.clientes[bloco.cliente].sabores[sabor].total += quantidade;

                estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] =
                    (estruturas.clientes[bloco.cliente].totaisTamanhos[tamanhoAtual] || 0) + quantidade;

                const pedidos = estruturas.clientes[bloco.cliente].pedidos;
                if (pedidos.length > 0) {
                    const ultimoPedido = pedidos[pedidos.length - 1];
                    ultimoPedido.itens.push({ sabor, quantidade });
                }
            }
        }
    });
}

function processarDadosVendas(input) {
    const config = {
        tamanhosValidos: produtos,
        termosIgnorar: ['FREte', '\\+', 'R\\$', 'REFIL', 'POD', 'º', 'ª', '°'],
        variacoesSabores: {
            'GREPE': 'GRAPE',
            'BLUBERRY': 'BLUEBERRY',
            'BABBALOO': 'BUBBALOO',
            'ICEMENTA': 'ICE MENTA',
            'KIWY': 'KIWI',
            'STRAWBERRY': 'STRAWBERRY',
            'GRAEPE': 'GRAPE'
        },
    };

    const blocos = separarBlocosPorClienteTopDown(input);

    const estruturas = {
        sabores: {},
        totaisTamanhos: {},
        clientes: {}
    };

    blocos.forEach(bloco => {
        processarBlocoDeLinhas(bloco, estruturas, config);
    });

    return {
        sabores: estruturas.sabores,
        totaisTamanhos: estruturas.totaisTamanhos,
        clientes: estruturas.clientes
    };
}

function processarDados() {
    const input = document.getElementById('inputDados').value;
    const resultadoConsolidadoDiv = document.getElementById('resultado-consolidado');
    const clientesContainer = document.getElementById('clientes-container');

    resultadoConsolidadoDiv.innerHTML = '';
    clientesContainer.innerHTML = '';

    try {
        const { sabores, totaisTamanhos, clientes } = processarDadosVendas(input);

        const tabelaConsolidada = gerarTabelaFormatada(sabores, totaisTamanhos);
        resultadoConsolidadoDiv.innerHTML = '<pre>' + tabelaConsolidada + '</pre>';

        for (const [nomeCliente, dadosCliente] of Object.entries(clientes)) {
            if (Object.keys(dadosCliente.sabores).length === 0) continue;

            const boxCliente = document.createElement('div');
            boxCliente.className = 'box-cliente';

            const titulo = document.createElement('div');
            titulo.className = 'box-cliente-titulo';
            titulo.textContent = `Cliente: ${nomeCliente}`;
            boxCliente.appendChild(titulo);

            const conteudo = document.createElement('div');
            conteudo.className = 'box-cliente-conteudo';

            const tabelaCliente = gerarTabelaFormatada(dadosCliente.sabores, dadosCliente.totaisTamanhos);
            conteudo.innerHTML = '<pre>' + tabelaCliente + '</pre>';

            boxCliente.appendChild(conteudo);
            clientesContainer.appendChild(boxCliente);
        }

    } catch (error) {
        resultadoConsolidadoDiv.textContent = 'Erro: ' + error.message;
    }
}

function gerarTabelaFormatada(sabores, totaisTamanhos) {
    const ordemTamanhos = produtos.filter(t => t in totaisTamanhos);

    const cabecalho = ['Sabor', ...ordemTamanhos, 'Total'];
    const linhas = [cabecalho];

    Object.keys(sabores)
        .sort((a, b) => a.localeCompare(b))
        .forEach(sabor => {
            const linha = [sabor];
            ordemTamanhos.forEach(t => linha.push(sabores[sabor].tamanhos[t] || 0));
            linha.push(sabores[sabor].total);
            linhas.push(linha);
        });

    linhas.push([
        'TOTAL',
        ...ordemTamanhos.map(t => totaisTamanhos[t]),
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)
    ]);

    const calcularLarguras = () => {
        return cabecalho.map((_, i) =>
            Math.max(...linhas.map(row => String(row[i]).length))
        );
    };

    const criarLinha = (conteudo, larguras) => {
        return '│ ' + conteudo
            .map((cell, i) => String(cell).padEnd(larguras[i]))
            .join(' │ ') + ' │';
    };

    const criarSeparador = (larguras) => {
        return '├─' + larguras.map(l => '─'.repeat(l)).join('─┼─') + '─┤';
    };

    const larguras = calcularLarguras();
    let tabela = [];

    tabela.push(criarLinha(cabecalho, larguras));
    tabela.push(criarSeparador(larguras));

    linhas.slice(1).forEach(linha => {
        tabela.push(criarLinha(linha, larguras));
    });

    return tabela.join('\n');
}

function baixarCSV() {
    const input = document.getElementById('inputDados').value;
    const nomeArquivoInput = document.getElementById('nomeArquivo').value.trim();
    const nomeArquivo = nomeArquivoInput ? nomeArquivoInput : 'relatorio_vendas';

    try {
        const { sabores, totaisTamanhos, clientes } = processarDadosVendas(input);

        let csvContent = [];
        csvContent.push('=== RELATÓRIO GERAL ===');
        csvContent.push('');
        csvContent.push(...gerarCSVTabela(sabores, totaisTamanhos));
        csvContent.push('');
        csvContent.push('');
        csvContent.push('=== RELATÓRIO POR CLIENTE ===');
        csvContent.push('');

        for (const [nomeCliente, dadosCliente] of Object.entries(clientes)) {
            if (Object.keys(dadosCliente.sabores).length === 0) continue;

            csvContent.push(`CLIENTE: ${nomeCliente}`);
            csvContent.push('');
            csvContent.push(...gerarCSVTabela(dadosCliente.sabores, dadosCliente.totaisTamanhos));
            csvContent.push('');
            csvContent.push('');
        }

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${nomeArquivo}.csv`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        alert('Erro ao gerar CSV: ' + error.message);
    }
}

function gerarCSVTabela(sabores, totaisTamanhos) {
    const ordemTamanhos = produtos.filter(t => t in totaisTamanhos);

    const cabecalho = ['Sabor', ...ordemTamanhos, 'Total'];
    const linhas = [cabecalho.join(',')];

    Object.keys(sabores)
        .sort((a, b) => a.localeCompare(b))
        .forEach(sabor => {
            const linha = [sabor];
            ordemTamanhos.forEach(t => linha.push(sabores[sabor].tamanhos[t] || 0));
            linha.push(sabores[sabor].total);
            linhas.push(linha.join(','));
        });

    const totalLine = [
        'TOTAL',
        ...ordemTamanhos.map(t => totaisTamanhos[t]),
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)
    ];
    linhas.push(totalLine.join(','));

    return linhas;
}

window.processarDados = processarDados;
window.baixarCSV = baixarCSV;