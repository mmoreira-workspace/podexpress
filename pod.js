function processarDadosVendas(input) {
    const config = {
        tamanhosValidos: [
            'V15', 'V50', 'V80', 'V120', 'V150', 'V250',
            'REFIL 10K', 'ELFBAR 10K', 'ELF BAR 10K', 'BLACK 20K', 'ELF BAR 30K'
        ],
        termosIgnorar: ['IGNITE', 'FREte', '\\+', 'R\\$', 'REFIL', 'POD', 'º', 'ª', '°'],
        variacoesSabores: {
            'GREPE': 'GRAPE',
            'BLUBERRY': 'BLUEBERRY',
            'MENTHOL✅': 'MENTHOL',
            'BABBALOO': 'BUBBALOO',
            'ICEMENTA': 'ICE MENTA',
            'KIWY': 'KIWI',
            'STRAWBERRY': 'STRAWBERRY'
        }
    };

    const sabores = {};
    const totaisTamanhos = {};
    let tamanhoAtual = null;

    const tamanhosValidos = new Set(config.tamanhosValidos.map(t => t.toUpperCase().replace(/\s+/g, ' ')));

    input.split('\n').forEach(linha => {
        const linhaOriginal = linha.trim();
        const linhaProcessada = linhaOriginal.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');

        const possivelTamanho = config.tamanhosValidos.find(t => {
            const regex = new RegExp(`\\b${t.toUpperCase().replace(/\s+/g, '\\s*')}\\b`, 'i');
            return regex.test(linhaProcessada);
        });

        if (possivelTamanho) {
            tamanhoAtual = possivelTamanho.toUpperCase().replace(/\s+/g, ' ');
            config.termosIgnorar.forEach(termo => {
                tamanhoAtual = tamanhoAtual.replace(new RegExp(termo, 'gi'), '');
            });
            tamanhoAtual = tamanhoAtual.trim().replace(/\s+/g, ' ');
            
            if (tamanhosValidos.has(tamanhoAtual)) {
                totaisTamanhos[tamanhoAtual] = totaisTamanhos[tamanhoAtual] || 0;
                return;
            }
        }

        if (tamanhoAtual && tamanhosValidos.has(tamanhoAtual)) {
            const matchVenda = linhaOriginal.match(/^\s*(\d+)\s*([^\d]+?)\s*[\W]*$/);
            if (matchVenda) {
                const [_, quantidadeStr, saborBruto] = matchVenda;
                const quantidade = parseInt(quantidadeStr);
                let sabor = saborBruto
                    .replace(/[^A-Za-z\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toUpperCase();

                Object.entries(config.variacoesSabores).forEach(([errado, correto]) => {
                    sabor = sabor.replace(new RegExp(errado, 'gi'), correto.toUpperCase());
                });

                if (!sabores[sabor]) {
                    sabores[sabor] = { tamanhos: {}, total: 0 };
                }

                sabores[sabor].tamanhos[tamanhoAtual] = 
                    (sabores[sabor].tamanhos[tamanhoAtual] || 0) + quantidade;
                
                sabores[sabor].total += quantidade;
                totaisTamanhos[tamanhoAtual] = (totaisTamanhos[tamanhoAtual] || 0) + quantidade;
            }
        }
    });

    return { sabores, totaisTamanhos };
}

function gerarTabelaFormatada(sabores, totaisTamanhos) {
    const ordemTamanhos = [
        'V15', 'V50', 'V80', 'V120', 'V150', 'V250',
        'REFIL 10K', 'ELFBAR 10K', 'BLACK 20K', 'ELF BAR 30K'
    ].filter(t => t in totaisTamanhos);

    // Preparar dados
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

    linhas.push(['TOTAL', ...ordemTamanhos.map(t => totaisTamanhos[t]), 
        Object.values(totaisTamanhos).reduce((a, b) => a + b, 0)]);

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

const inputTeste = `
[18:33, 01/04/2025] Matheus: v150 ignite 65,00
1 green apple✅

v80 ignite 65,00 
1 grape ice✅
1 green apple✅

v250 ignite 90,00 + 20,00 frete
1 pineaaple kiwi dragon✅
1 sweet and sour✅

Carolina D A
[18:34, 01/04/2025] Matheus: v150 ignite 65,00
1 green apple✅

v80 ignite 65,00 
1 grape ice✅
1 green apple✅

v250 ignite 90,00 + 20,00 frete
1 pineaaple kiwi dragon✅
1 sweet and sour✅

Carolina D A
[18:34, 01/04/2025] Matheus: v150 ignite 65,00
1 green apple✅

v80 ignite 65,00 
1 grape ice✅
1 green apple✅

v250 ignite 90,00 + 20,00 frete
1 pineaaple kiwi dragon✅
1 sweet and sour✅

Carolina D A
[18:34, 01/04/2025] Matheus: v150 ignite 65,00
1 green apple✅

v80 ignite 65,00 
1 grape ice✅
1 green apple✅

v250 ignite 90,00 + 20,00 frete
1 pineaaple kiwi dragon✅
1 sweet and sour✅

Carolina D A
[18:34, 01/04/2025] Matheus: v150 ignite 65,00
1 green apple✅

v80 ignite 65,00 
1 grape ice✅
1 green apple✅

v250 ignite 90,00 + 20,00 frete
1 pineaaple kiwi dragon✅
1 sweet and sour✅

Carolina D A
`;

const { sabores, totaisTamanhos } = processarDadosVendas(inputTeste);
console.log(gerarTabelaFormatada(sabores, totaisTamanhos));